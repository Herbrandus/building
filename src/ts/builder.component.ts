import { MapGenerationFunctions } from './mapGenerationFunctions.component'
import { Color } from './colors.component'
import { Map } from './mapper.component'
import { Tile } from './tile.component'
import { Config } from './config.component'
import { TileType } from './enums/tile-type.enum'
import { Coords } from './interfaces/coords.interface'
import { TileTemplate } from './interfaces/tiletemplate.interface'
import { Position } from './interfaces/position.interface'
import { RenderElements } from './renderelements.component'
import { TileOptionsFunctions } from './interfaces/tile-options.interface'

export class Renderer {	

	private config: Config = new Config()
	private calculations: MapGenerationFunctions = new MapGenerationFunctions()
	private tileOptionFuncs: TileOptionsFunctions = new TileOptionsFunctions()
	private render: RenderElements = new RenderElements()
	private tileW: number = this.config.tileWidth
	private tileL: number = this.config.tileLength
	private tileH: number = this.config.tileHeight
	private bleed: number = this.config.tileEdgeBleed
	private dimensions = this.calculations.calculateStraightLinesFromIsometricSquare(this.tileW, this.tileL)

	constructor() {	}

	showData(map: Map): string {

		let html = '<div class="showData">'
		html += `map width: ${map.mapWidth} tiles<br>map length: ${map.mapLength} tiles<br>`
		html += `tile width: ${this.config.tileWidth}<br>tile length: ${this.config.tileLength}<br>`
		html += '</div>'

		return html
	}

	build2DMap(map: Map): string {

		let htmlMap = `<div class="map" style="width:${this.config.getMapWidth(map.mapWidth+1)}px;">`

		htmlMap += `<div class="tile axis" style="width:${this.config.tileWidth}px;height:${this.config.tileLength}px;"></div>`

		for (let i = 0; i < map.mapWidth; i++) {
			htmlMap += `<div class="tile axis" style="width:${this.config.tileWidth}px;height:${this.config.tileLength}px;">${i}</div>`
		}

		for (let y = 0; y < map.mapLength; y++) {

			let halfWay = ''

			if (y === Math.round(map.mapLength / 2)) {
				halfWay = ' half'
			}

			htmlMap += `<div class="tile axis${halfWay}" style="width:${this.config.tileWidth}px;height:${this.config.tileLength}px;">${y}</div>`

			for (let x = 0; x < map.mapWidth; x++) {

				htmlMap += `<div data-y="${y}" data-x="${x}" class="tile${halfWay}" style="width:${this.config.tileWidth}px;height:${this.config.tileLength}px;`

				if (map.getColumn(x, y).isDefined && map.getTopTile(x, y)) {
					
					let tile = map.getTopTile(x, y)
					let tileTopColor = tile.tileColor.rgb()
					let tileColor = `rgb(${tileTopColor['r']}, ${tileTopColor['g']}, ${tileTopColor['b']})`
					let emptyBlocksPresent = false
					let slopePresent = false
					for (let h = 0; h < map.map[y][x].height; h++) {
						if (map.map[y][x].tileStack[h].type === TileType.None) {
							emptyBlocksPresent = true
							break;
						}
					}
					for (let h = 0; h < map.map[y][x].height; h++) {
						if (map.map[y][x].tileStack[h].options.slope) {
							slopePresent = true
							break;
						}
					}
					let edge = (map.map[y][x].edge.top || map.map[y][x].edge.right || map.map[y][x].edge.bottom || map.map[y][x].edge.left) ? true : false
					let blockGroup = map.map[y][x].blockGroup
					let tower = false
					for (let h = 0; h < map.map[y][x].height; h++) {
						if (map.map[y][x].tileStack[h].options.tower) {
							tower = true
							break;
						}
					}

					let indicateEmptyBlocks = emptyBlocksPresent ? 'x' : (slopePresent ? 'S' : '')

					htmlMap += `background-color:${tileColor}">${indicateEmptyBlocks}<div class="tileInfo">x: ${x} y: ${y}<br>height: ${map.map[y][x].height}<br>edge: ${edge}<br>group: ${blockGroup}<br>tower: ${tower}</div></div>`

				} else {

					htmlMap += `"></div>`
				}
			}
		}

		htmlMap += `</div>`

		return htmlMap
	}

	buildMap(mapToBuild: Map): string {

		const mapTotalWidth = mapToBuild.mapWidth
		const mapTotalLength = mapToBuild.mapLength
		const tileHeight = this.config.tileHeight
		const windowLights = this.config.lightInWindows

		const testTile = this.render.createTile(0, 0, '')

		const xDeviation = testTile.coords.bottom.x - testTile.coords.top.x
		const yDeviation = testTile.coords.right.y - testTile.coords.left.y
		let tileHalfWidthLeft = testTile.coords.top.x - testTile.coords.left.x
		let tileHalfWidthRight = testTile.coords.right.x - testTile.coords.top.x
		let tileBottomToTop = testTile.coords.bottom.y - testTile.coords.top.y
		let mapWidthLeft = tileHalfWidthLeft * mapTotalLength
		let mapWidthRight = tileHalfWidthRight * mapTotalWidth
		let tileHalfLengthTop = testTile.coords.right.y
		let tileHalfLengthBottom = testTile.coords.bottom.y - testTile.coords.right.y
		let mapLengthTop = tileHalfLengthTop * mapTotalWidth
		let mapLengthBottom = tileHalfLengthBottom * mapTotalLength
		let mapWidthPx = Math.round((tileHalfWidthLeft + tileHalfWidthRight) * (mapTotalWidth ))
		let mapLengthPx = Math.round(mapLengthTop + mapLengthBottom) + this.config.topMargin

		const shadowColor = this.config.groundColor.changeColorLighting(-20)

		const map = mapToBuild.map

		let detailsHtml = ''
		let html = '<svg width="'+mapWidthPx+'" height="'+mapLengthPx+'">'

		let lastTile = null
		let startTileX = tileHalfWidthLeft * (mapTotalWidth - 1)

		const topPavementType = Math.floor(Math.random() * 5)
		const randomPaving = Math.floor(Math.random() * 5)
		let pavementType = ''

		const towersByGroup = {}

		if (topPavementType === 1) {
			pavementType = 'triangles'
		} else if (topPavementType === 2) {
			pavementType = 'circles'	
		} else if (topPavementType === 3) {
			pavementType = 'squares'	
		}	

		for (let y = 0; y < mapTotalLength; y++) {

			for (let x = 0; x < mapTotalWidth; x++) {

				let thisPosY = 0
				let thisPosX = 0

				if (x === 0 && y === 0) {
					thisPosX = startTileX
				}

				if (lastTile != null) {
					thisPosY = lastTile.coords.right.y
				}

				if (y > 0 && x === 0) {
					thisPosX = startTileX - (tileHalfWidthLeft * y)
					thisPosY = (tileHalfLengthTop * y) - (yDeviation * y)
				}	
				
				if (x > 0) {
					thisPosX = (lastTile.coords.right.x - (lastTile.coords.right.x - lastTile.coords.bottom.x))
				}

				let newTile = this.render.createTile(thisPosX, thisPosY, 'shade')
				let newData = ''
				
				if (map[y][x].isDefined) {

					if (map[y][x].tileStack[0].type === TileType.Shadow) {
						let color = shadowColor
						newData += this.render.createPlane(thisPosX, thisPosY, map[y][x].tileStack[0], color).html
					} else if (map[y][x].tileStack[0].type === TileType.Grass) {
						let color = map[y][x].tileStack[0].tileColor
						newData += this.render.createPlane(thisPosX, thisPosY, map[y][x].tileStack[0], color).html
					}

					if (map[y][x].height === 0) {

						if (map[y][x].tileStack[0].type === TileType.None && map[y][x].tileStack[0].options.areaDecoration !== '') {

							if (map[y][x].tileStack[0].options.areaDecoration === 'tree') {
								const treeData = this.render.createTree(thisPosX, thisPosY)
								newData += treeData.html
							}
						}
					}

					if (map[y][x].height > 0) {

						newData += this.render.createPlane(thisPosX, thisPosY, map[y][x].tileStack[0], shadowColor).html

						let slopeInCol = false

						for (let h = 0; h < map[y][x].height; h++) {

							let currentTile = map[y][x].tileStack[h]
							let options

							if (currentTile.options) {
								options = currentTile.options
							} else {
								options = this.tileOptionFuncs.getDefaultTileOptions()
							}

							if (options.slope) {
								slopeInCol = true
							}

							if (currentTile.type === TileType.Body) {
								
								if (currentTile.options.slope) {
									let slope = this.render.createSlopeBlock(thisPosX, thisPosY + (tileHeight * 4.75), map[y][x].getTile(h), 'e')
									newData += slope.html
								} else {
									if (!slopeInCol) {
										
										let isTop = ''
										if (map[y][x].blockGroup % 2 === 1 && map[y][x].tileStack[h].options.roof) {
											
											isTop = pavementType

											if (randomPaving > 2) {
												if (topPavementType === 1) {
													isTop = 'triangles'
												} else if (topPavementType === 2) {
													isTop = 'circles'	
												} else if (topPavementType === 3) {
													isTop = 'squares'	
												}
											}																												
										}

										let tile = this.render.createBlock(thisPosX, thisPosY - tileHeight, currentTile, isTop)
										newData += tile.html

										if (currentTile.options.windowed > 0) {
											if (map[y][x].edge.right || map[y][x].edge.bottom) {
												if (Math.round(Math.random() * 6) > 4) {
													let window = this.render.createWindow(thisPosX, thisPosY - tileHeight, currentTile, map[y][x], windowLights)
													newData += window.html
												}										
											}
											if (map[y][x].edge.bottom && (h === map[y+1][x].height || h === 0) && Math.round(Math.random() * 10) > 8) {
												let door = this.render.createDoor(thisPosX, thisPosY - tileHeight, currentTile, map[y][x], 'bottom')
												newData += door.html
											} else if (map[y][x].edge.right && (h === map[y][x+1].height || h === 0) && Math.round(Math.random() * 10) > 8) {
												let door = this.render.createDoor(thisPosX, thisPosY - tileHeight, currentTile, map[y][x], 'right')
												newData += door.html
											}
										}
									}
								}								

							} else if (!options.tower && currentTile.type === TileType.HalfBlock) {

								let tile = this.render.createHalfBlock(thisPosX, thisPosY - tileHeight, currentTile)
								newData += tile.html

							} else if (!options.tower && currentTile.type === TileType.None) {

								if (currentTile.options.pillar && h < map[y][x].height) {
									if (y < (mapTotalLength/2)-1 || y > (mapTotalLength/2)) {
										let pillar = this.render.createPillarBlock(thisPosX, thisPosY - tileHeight, currentTile)
										newData += pillar.html
									}
								}

								if (currentTile.options.halfArch) {

									if (y > 1 && y < mapTotalLength - 1) {
										if (map[y+1][x].isDefined && map[y+1][x].height > 0 && map[y+1][x].height > h && map[y+1][x].tileStack[h].type === TileType.None) {
											let arch = this.render.createHalfArch(thisPosX, thisPosY - tileHeight, currentTile, 'right-top')
											newData += arch.html
										} else if (map[y-1][x].isDefined && map[y-1][x].height > 0 && map[y-1][x].height > h && map[y-1][x].tileStack[h].type === TileType.None) {
											let arch = this.render.createHalfArch(thisPosX, thisPosY - tileHeight, currentTile, 'right-bottom')
											newData += arch.html
										}
									}
								}
							}

							if (h === map[y][x].height - 1 && currentTile.options.tower) {

								if (y < mapTotalLength - 1 && x < mapTotalWidth - 1) {

									if (map[y][x].blockGroup in towersByGroup) {
										towersByGroup[`${map[y][x].blockGroup}`].push({ y, x })
									} else {
										towersByGroup[`${map[y][x].blockGroup}`] = [{ y, x }]
									}

									const nextYblockDefined = map[y + 1][x].isDefined
									const nextXblockDefined = map[y][x + 1].isDefined

									if (
										((nextYblockDefined && !map[y + 1][x].tileStack[0].options.tower) || !nextYblockDefined) 
										&& 
										((nextXblockDefined && !map[y][x + 1].tileStack[0].options.tower) || !nextXblockDefined)
										) {

										const towerGroup = towersByGroup[map[y][x].blockGroup]
										let lowestY = mapTotalLength
										let highestY = 0
										let lowestX = mapTotalWidth
										let highestX = 0

										towerGroup.forEach(coord => {
											if (lowestY > coord.y) lowestY = coord.y
											if (highestY < coord.y) highestY = coord.y
											if (lowestX > coord.x) lowestX = coord.x
											if (highestX < coord.x) highestX = coord.x
										})

										const top: Position = { "x": Math.ceil(thisPosX + this.dimensions.horizontalWidthFromTop), "y": Math.ceil(thisPosY + this.config.topMargin ) }
										const left: Position = { "x": Math.ceil(thisPosX), "y": Math.ceil(thisPosY + this.dimensions.verticalHeightFromTop + this.config.topMargin ) }
										const bottom: Position = { "x": Math.ceil(thisPosX + this.dimensions.horizontalWidthFromBottom), "y": Math.ceil(thisPosY + this.dimensions.totalHeight + this.config.topMargin ) }
										const right: Position = { "x": Math.ceil(thisPosX + this.dimensions.totalWidth), "y": Math.ceil(thisPosY + this.dimensions.verticalHeightFromBottom + this.config.topMargin ) }

										const mostLeft = {
											x: (lowestX < x) ? left.x - (tileHalfWidthRight * (x - lowestX)) : left.x,
											y: (lowestX < x) ? left.y - (tileHalfLengthBottom * (x - lowestX)) : left.y
										}

										const mostRight = {
											x: (lowestY < y) ? right.x + (tileHalfWidthRight * (y - lowestY)) : right.x,
											y: (lowestY < y) ? right.y - (tileHalfLengthBottom * (y - lowestY)) : right.y
										}

										const mostTop = {
											x: (lowestX < x) ? mostRight.x - (tileHalfWidthRight * (x - lowestX + 1)) : mostRight.x - tileHalfWidthRight,
											y: (lowestX < x) ? mostRight.y - (tileHalfLengthBottom * (x - lowestX + 1)) : mostRight.y - tileHalfLengthBottom
										}

										newData += this.render.createTowerTop(
											{ x: mostLeft.x, y: mostLeft.y - (tileHeight * map[y][x].height) },
											{ x: bottom.x, y: bottom.y - (tileHeight * map[y][x].height) },
											{ x: mostRight.x, y: mostRight.y - (tileHeight * map[y][x].height) },
											{ x: mostTop.x, y: mostTop.y - (tileHeight * map[y][x].height) },
											Math.floor(2 + Math.random() * 5),
											map[y][x].tileStack[h])
									}
								}																
							}
						}
					}					
				}

				html += newData

				lastTile = newTile
			}
		}

		html += '</svg>'

		// document.querySelector('#debug').innerHTML = detailsHtml

		return '<div id="debug">' + detailsHtml + '</div>' + html
	}

	addSlopedEdges(map: any[], x: number, y: number, h: number, xPos: number, yPos: number) {

		let tile = null

		if (map[y][x].edge.top && !map[y][x].corner && h === map[y][x].height-1) {
			tile = this.render.createSlopeBlock(xPos, yPos - this.config.tileHeight, map[y][x].getTile(h), 'n')
		} else if (map[y][x].edge.bottom && !map[y][x].corner && h === map[y][x].height-1) {
			tile = this.render.createSlopeBlock(xPos, yPos - this.config.tileHeight, map[y][x].getTile(h), 's')
		} else if (map[y][x].edge.right && !map[y][x].corner && h === map[y][x].height-1) {
			tile = this.render.createSlopeBlock(xPos, yPos - this.config.tileHeight, map[y][x].getTile(h), 'e')
		} else if (map[y][x].edge.left && !map[y][x].corner && h === map[y][x].height-1) {
			tile = this.render.createSlopeBlock(xPos, yPos - this.config.tileHeight, map[y][x].getTile(h), 'w')
		} else {
			tile = this.render.createBlock(xPos, yPos - this.config.tileHeight, map[y][x].getTile(h))	
		}

		if (map[y][x].corner && h === map[y][x].height-1) {
			if (map[y][x].edge.top && map[y][x].edge.left) {
				tile = this.render.createSlopeBlock(xPos, yPos - this.config.tileHeight, map[y][x].getTile(h), 'nw')
			} else if (map[y][x].edge.top && map[y][x].edge.right) {
				tile = this.render.createSlopeBlock(xPos, yPos - this.config.tileHeight, map[y][x].getTile(h), 'ne')
			} else if (map[y][x].edge.bottom && map[y][x].edge.left) {
				tile = this.render.createSlopeBlock(xPos, yPos - this.config.tileHeight, map[y][x].getTile(h), 'sw')
			} else if (map[y][x].edge.bottom && map[y][x].edge.right) {
				tile = this.render.createSlopeBlock(xPos, yPos - this.config.tileHeight, map[y][x].getTile(h), 'se')
			}
		}

		return tile
	}
}
