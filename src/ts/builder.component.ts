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

					let edge = (map.map[y][x].edge.top || map.map[y][x].edge.right || map.map[y][x].edge.bottom || map.map[y][x].edge.left) ? true : false
					let blockGroup = map.map[y][x].blockGroup

					htmlMap += `background-color:${tileColor}"><div class="tileInfo">x: ${x} y: ${y}<br>height: ${map.map[y][x].height}<br>edge: ${edge}<br>group: ${blockGroup}</div></div>`

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

						for (let h = 0; h < map[y][x].height; h++) {

							let currentTile = map[y][x].tileStack[h]

							if (currentTile.type === TileType.Body) {
								let tile = this.render.createBlock(thisPosX, thisPosY - this.config.tileHeight, currentTile)
								newData += tile.html

								if (currentTile.options.windowed > 0) {
									//let window = this.render.createWindow(thisPosX, thisPosY - (this.config.tileHeight * h), currentTile, map[y][x])
									//newData += window.html
								}								

								if (this.config.allowDebug) {
									if (h === map[y][x].height - 1) {
										let debugInfo = `<span>x: ${x}, y: ${y} <span class="debugLink showGroups" data-group="${map[y][x].blockGroup}">groupId: ${map[y][x].blockGroup}</span><br>id: ${currentTile.id}  h: ${h}</span>`
										detailsHtml += `<div class="blockLabel" data-groupId="${map[y][x].blockGroup}" style="left: ${tile.coords.top.x}px; top: ${tile.coords.top.y - (this.config.tileHeight * h-1)}px;"><div class="point"></div>${debugInfo}</div>`
									}
								}

							} else if (currentTile.type === TileType.HalfBlock) {

								let tile = this.render.createHalfBlock(thisPosX, thisPosY- this.config.tileHeight, currentTile)
								newData += tile.html

							} else if (currentTile.type === TileType.None) {

								if (currentTile.options.pillar && h < map[y][x].height) {
									if (y < (mapTotalLength/2)-1 || y > (mapTotalLength/2)) {
										let pillar = this.render.createPillarBlock(thisPosX, thisPosY- this.config.tileHeight, currentTile)
										newData += pillar.html
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
