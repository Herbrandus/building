import { MapGenerationFunctions, Color } from './mapGenerationFunctions.component'
import { Map } from './mapper.component'
import { Tile, TileType } from './tile.component'
import { Config, Coords, TileTemplate, Position } from './config.component'
import { RenderElements } from './renderelements.component'

export class Renderer {	

	private config: Config = new Config()
	private calculations: MapGenerationFunctions = new MapGenerationFunctions()
	private render: RenderElements = new RenderElements()

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

				htmlMap += `<div class="tile${halfWay}" style="width:${this.config.tileWidth}px;height:${this.config.tileLength}px;`

				if (map.getColumn(x, y).isDefined && map.getTopTile(x, y)) {
					
					let tile = map.getTopTile(x, y)
					let tileTopColor = tile.getColor().rgb()
					let tileColor = `rgb(${tileTopColor['r']}, ${tileTopColor['g']}, ${tileTopColor['b']})`
					let emptyBlocksPresent = false
					for (let h = 0; h < map.map[y][x].height; h++) {
						if (map.map[y][x].tileStack[h].type === TileType.None) {
							emptyBlocksPresent = true
							break;
						}
					}
					let edge = (map.map[y][x].edge.top || map.map[y][x].edge.right || map.map[y][x].edge.bottom || map.map[y][x].edge.left) ? true : false
					let blockGroup = map.map[y][x].blockGroup

					let indicateEmptyBlocks = emptyBlocksPresent ? 'x' : ''

					htmlMap += `background-color:${tileColor}">${indicateEmptyBlocks}<div class="tileInfo">x: ${x} y: ${y}<br>height: ${map.map[y][x].height}<br>edge: ${edge}<br>group: ${blockGroup}</div></div>`

				} else {

					htmlMap += `"></div>`
				}
			}
		}

		htmlMap += `</div>`

		return htmlMap
	}

	buildMap(mapToBuild: Map): string {

		let mapTotalWidth = mapToBuild.mapWidth
		let mapTotalLength = mapToBuild.mapLength
		const tileHeight = this.config.tileHeight
		const windowLights = this.config.lightInWindows

		console.log('windowLights', windowLights)

		let testTile = this.render.createTile(0, 0, '')

		let xDeviation = testTile.coords.bottom.x - testTile.coords.top.x
		let yDeviation = testTile.coords.right.y - testTile.coords.left.y
		let tileHalfWidthLeft = testTile.coords.top.x - testTile.coords.left.x
		let tileHalfWidthRight = testTile.coords.right.x - testTile.coords.top.x
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

					if (map[y][x].height > 0) {

						newData += this.render.createPlane(thisPosX, thisPosY, map[y][x].tileStack[0], shadowColor).html

						let slopeInCol = false

						for (let h = 0; h < map[y][x].height; h++) {

							let currentTile = map[y][x].tileStack[h]
							let options

							if (currentTile.options) {
								options = currentTile.options
							} else {
								options = {
									roof: false,
									pillar: false,
									slope: false,
									windowed: 0,
									tower: false,
									stairs:	false,
									halfArch: false,
									wholeArch: false
								}
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
										let tile = this.render.createBlock(thisPosX, thisPosY - tileHeight, currentTile)
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

									if (map[y+1][x].isDefined && map[y+1][x].height > 0 && map[y+1][x].height > h && map[y+1][x].tileStack[h].type === TileType.None) {
										let arch = this.render.createHalfArch(thisPosX, thisPosY - tileHeight, currentTile, 'right-top')
										newData += arch.html
									} else if (map[y-1][x].isDefined && map[y-1][x].height > 0 && map[y-1][x].height > h && map[y-1][x].tileStack[h].type === TileType.None) {
										let arch = this.render.createHalfArch(thisPosX, thisPosY - tileHeight, currentTile, 'right-bottom')
										newData += arch.html
									}
								}
							} else if (currentTile.options.tower) {
								let tile = this.render.createBlock(thisPosX, thisPosY - tileHeight, currentTile)
								newData += tile.html
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
