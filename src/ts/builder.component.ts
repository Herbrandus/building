import Map from './mapper.component'
import { Tile, TileType } from './tile.component'
import Config from './config.component'

export default class Builder {	

	private _config: Config = new Config()

	constructor() {	}

	showData(map: Map): string {

		let html = '<div class="showData">'

		html += `map width: ${map.mapWidth} tiles<br>map length: ${map.mapLength} tiles<br>`
		html += `tile width: ${this._config.tileWidth}<br>tile length: ${this._config.tileLength}<br>`
		html += '</div>'

		return html
	}

	build2DMap(map: Map): string {

		let htmlMap = `<div class="map" style="width:${this._config.getMapWidth(map.mapWidth)}px;">`

		for (let y = 0; y < map.mapLength; y++) {
			for (let x = 0; x < map.mapWidth; x++) {

				htmlMap += `<div class="tile" style="width:${this._config.tileWidth}px;height:${this._config.tileLength}px;`

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

		let htmlMap = '';

		return htmlMap
	}
}