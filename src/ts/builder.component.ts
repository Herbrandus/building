import { MapGenerationFunctions } from './mapGenerationFunctions.component'
import Map from './mapper.component'
import { Tile, TileType } from './tile.component'
import Config from './config.component'

export default class Builder {	

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
					let tileTopColor = tile.getColor()
					let tileColor = `rgb(${tileTopColor['r']}, ${tileTopColor['g']}, ${tileTopColor['b']})`

					htmlMap += `background-color:${tileColor};">${tile.id}<br>(${x}, ${y})</div>`

				} else {

					htmlMap += `">${x}, ${y}</div>`
				}
			
			}
		}

		htmlMap += `</div>`

		return htmlMap
	}

	buildMap(map: Map): string {

		let mapTotalWidth = this.config.getMapWidth(map.mapWidth)
		let mapTotalLength = this.config.getMapLength(map.mapLength)

		let htmlMap = '<svg width="" height=""></svg>';

		return htmlMap
	}

	createTile(): string {

		let tileW = this.config.tileWidth
		let tileL = this.config.tileLength
		let angle = this.config.tileAngle

		// split into two triangles to calculate isometric dimensions of tile

		// calculate opposite with: sin(angle) * hypotenuse
		let oppositeL = Math.sin(angle) * tileW
		let oppositeR = Math.sin(angle) * tileL

		// calculate adjacent with: sqrt(hypotenuse(2) - opposite(2))
		let adjacentL = Math.sqrt(Math.pow(tileW, 2) - Math.pow(oppositeL, 2))
		let adjacentR = Math.sqrt(Math.pow(tileL, 2) - Math.pow(oppositeR, 2))

		let canvasWidth = adjacentL + adjacentR
		let canvasLength = canvasWidth

		let dimensions = this.calculations.calculateStraightLinesFromIsometricSquare(tileW, tileL);

		console.log(dimensions)

		var html = `<svg width="${dimensions.totalWidth}" height="${dimensions.totalHeight+2}" style="border:#666 solid 1px;">
				<path fill="red" 
					d="M 0 ${dimensions.verticalHeightFromTop} 
					L${dimensions.horizontalWidthFromBottom} ${dimensions.totalHeight}
					L${dimensions.totalWidth} ${dimensions.verticalHeightFromBottom}
					L${dimensions.horizontalWidthFromTop} 0 
					L0 ${dimensions.verticalHeightFromTop} Z" />`
		html += '</svg>'

		return html
	}
}