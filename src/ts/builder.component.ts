import { MapGenerationFunctions, Color } from './mapGenerationFunctions.component'
import Map from './mapper.component'
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

		let htmlMap = `<div class="map" style="width:${this.config.getMapWidth(map.mapWidth)}px;">`

		for (let y = 0; y < map.mapLength; y++) {
			for (let x = 0; x < map.mapWidth; x++) {

				htmlMap += `<div class="tile" style="width:${this.config.tileWidth}px;height:${this.config.tileLength}px;`

				if (map.getColumn(x, y).isDefined) {
					
					let tile = map.getTopTile(x, y)
					let tileTopColor = tile.getColor().rgb()
					let tileColor = `rgb(${tileTopColor['r']}, ${tileTopColor['g']}, ${tileTopColor['b']})`

					htmlMap += `background-color:${tileColor}">${tile.id}<br>(${x}, ${y})</div>`

				} else {

					htmlMap += `">${x}, ${y}</div>`
				}
			}
		}

		htmlMap += `</div>`

		return htmlMap
	}

	buildMap(mapToBuild: Map): string {

		let mapTotalWidth = mapToBuild.mapWidth
		let mapTotalLength = mapToBuild.mapLength

		let testTile = this.render.createTile(0, 0)

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
		let mapLengthPx = Math.round(mapLengthTop + mapLengthBottom)

		console.log('map:', mapToBuild.map)
		const map = mapToBuild.map

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

				let newTile = this.render.createTile(thisPosX, thisPosY)
				let newData = ''

				if (map[y][x].isDefined) {
					for (let h = 0; h < map[y][x].height; h++) {

						let tile = this.addSlopedEdges(map, x, y, h, thisPosX, thisPosY)
						
						newData += tile.html
					}
				}

				html += newTile.html + newData

				lastTile = newTile
			}
		}

		html += '</svg>'

		return html
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
