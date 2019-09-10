import { MapGenerationFunctions, Color } from './mapGenerationFunctions.component'
import Map from './mapper.component'
import { Tile, TileType } from './tile.component'
import { Config, Coords, TileTemplate, Position } from './config.component'

export class Renderer {	

	private config: Config = new Config()
	private calculations: MapGenerationFunctions = new MapGenerationFunctions()

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

		let testTile = this.createTile(0, 0)

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

				let newTile = this.createTile(thisPosX, thisPosY)
				let newData = ''

				if (map[y][x].isDefined) {
					console.log(map[y][x])
					for (let h = 0; h < map[y][x].height; h++) {
						let tile = this.createBlock(thisPosX, thisPosY - this.config.tileHeight, map[y][x].getTile(h))
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

	createTile(xPos: number, yPos: number): TileTemplate {

		let tileW = this.config.tileWidth
		let tileL = this.config.tileLength
		let bleed = this.config.tileEdgeBleed

		let tileColor = this.config.groundColor.hex()

		let dimensions = this.calculations.calculateStraightLinesFromIsometricSquare(tileW, tileL)

		let top: Position = { "x": (xPos + dimensions.horizontalWidthFromTop), "y": yPos}
		let left: Position = { "x": xPos, "y": (yPos + dimensions.verticalHeightFromTop) }
		let bottom: Position = { "x": (xPos + dimensions.horizontalWidthFromBottom), "y": (yPos + dimensions.totalHeight) }
		let right: Position = { "x": (xPos + dimensions.totalWidth), "y": (yPos + dimensions.verticalHeightFromBottom) }

		let pointTop = `${top.x} ${top.y-bleed}`
		let pointLeft = `${left.x-bleed} ${left.y}`
		let pointBottom = `${bottom.x} ${bottom.y+bleed}`
		let pointRight = `${right.x+bleed} ${right.y}`

		var html = `<path fill="${tileColor}"
					d="M${pointLeft} 
					L${pointBottom} 
					L${pointRight} 
					L${pointTop} 
					L${pointLeft} Z" />`

		let coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right }

		return { html: html, coords: coords }
	}

	createBlock(xPos: number, yPos: number, tile: Tile): TileTemplate {

		let tileW = this.config.tileWidth
		let tileL = this.config.tileLength
		let tileH = this.config.tileHeight
		let bleed = this.config.tileEdgeBleed

		let id = tile.id
		let height = (tile.h * tileH) - tileH

		let regularColor = this.config.buildingBaseColor.hex()
		let highlightColor = `rgb(${this.config.buildingBaseColor.getHighlightsRGB().r},${this.config.buildingBaseColor.getHighlightsRGB().g},${this.config.buildingBaseColor.getHighlightsRGB().b})`
		let shadowColor = `rgb(${this.config.buildingBaseColor.getShadowsRGB().r},${this.config.buildingBaseColor.getShadowsRGB().g},${this.config.buildingBaseColor.getShadowsRGB().b})`

		let dimensions = this.calculations.calculateStraightLinesFromIsometricSquare(tileW, tileL)

		let top: Position = { "x": (xPos + dimensions.horizontalWidthFromTop), "y": yPos }
		let left: Position = { "x": xPos, "y": (yPos + dimensions.verticalHeightFromTop) }
		let bottom: Position = { "x": (xPos + dimensions.horizontalWidthFromBottom), "y": (yPos + dimensions.totalHeight) }
		let right: Position = { "x": (xPos + dimensions.totalWidth), "y": (yPos + dimensions.verticalHeightFromBottom) }

		let leftWallLeftTop = `${left.x-bleed} ${left.y-height-tileH}`
		let leftWallLeftBottom = `${left.x-bleed} ${left.y-height+bleed}`
		let leftWallRightBottom = `${bottom.x} ${bottom.y-height+bleed}`
		let leftWallRightTop = `${bottom.x} ${bottom.y-height-tileH}`

		let rightWallLeftTop = `${bottom.x} ${bottom.y-height-tileH}`
		let rightWallLeftBottom = `${bottom.x} ${bottom.y-height+bleed}`
		let rightWallRightBottom = `${right.x+bleed} ${right.y-height+bleed}`
		let rightWallRightTop = `${right.x+bleed} ${right.y-height-tileH}`

		let blockTopLeft = `${left.x-bleed} ${left.y-height-tileH}`
		let blockTopBottom = `${bottom.x} ${bottom.y-height-tileH}`
		let blockTopRight = `${right.x+bleed} ${right.y-height-tileH}`
		let blockTopTop = `${top.x} ${top.y-height-tileH}`


		let html = `<g style="z-index:${id};"><path fill="${shadowColor}"
					d="M${leftWallLeftTop} 
					L${leftWallLeftBottom} 
					L${leftWallRightBottom} 
					L${leftWallRightTop} 
					L${leftWallLeftTop} Z" />
					<path fill="${regularColor}"
					d="M${rightWallLeftTop} 
					L${rightWallLeftBottom} 
					L${rightWallRightBottom} 
					L${rightWallRightTop} 
					L${rightWallLeftTop} Z" />
					<path fill="${highlightColor}"
					d="M${blockTopLeft} 
					L${blockTopBottom} 
					L${blockTopRight} 
					L${blockTopTop} 
					L${blockTopLeft} Z" /></g>`

		let coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right }

		return { html: html, coords: coords }
	}
}
