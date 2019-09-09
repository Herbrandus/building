import { MapGenerationFunctions } from './mapGenerationFunctions.component'
import Map from './mapper.component'
import { Tile, TileType } from './tile.component'
import { Config, Coords, TileTemplate, Position } from './config.component'

export class Builder {	

	private config: Config = new Config();
	private calculations: MapGenerationFunctions = new MapGenerationFunctions();

	constructor() {	}

	showData(map: Map): string {

		let html = '<div class="showData">';
		html += `map width: ${map.mapWidth} tiles<br>map length: ${map.mapLength} tiles<br>`;
		html += `tile width: ${this.config.tileWidth}<br>tile length: ${this.config.tileLength}<br>`;
		html += '</div>';

		return html
	}

	build2DMap(map: Map): string {

		let htmlMap = `<div class="map" style="width:${this.config.getMapWidth(map.mapWidth)}px;">`;

		for (let y = 0; y < map.mapLength; y++) {
			for (let x = 0; x < map.mapWidth; x++) {

				htmlMap += `<div class="tile" style="width:${this.config.tileWidth}px;height:${this.config.tileLength}px;`;

				if (map.getColumn(x, y).isDefined) {
					
					let tile = map.getTopTile(x, y);
					let tileTopColor = tile.getColor();
					let tileColor = `rgb(${tileTopColor['r']}, ${tileTopColor['g']}, ${tileTopColor['b']})`;

					htmlMap += `background-color:${tileColor};">${tile.id}<br>(${x}, ${y})</div>`;

				} else {

					htmlMap += `">${x}, ${y}</div>`;
				}
			
			}
		}

		htmlMap += `</div>`;

		return htmlMap
	}

	buildMap(map: Map): string {

		let mapTotalWidth = map.mapWidth;
		let mapTotalLength = map.mapLength;

		let testTile = this.createTile(0, 0);

		let xDeviation = testTile.coords.bottom.x - testTile.coords.top.x;
		let yDeviation = testTile.coords.right.y - testTile.coords.left.y;
		let tileHalfWidthLeft = testTile.coords.top.x - testTile.coords.left.x;
		let tileHalfWidthRight = testTile.coords.right.x - testTile.coords.top.x;
		let mapWidthLeft = tileHalfWidthLeft * mapTotalLength;
		let mapWidthRight = tileHalfWidthRight * mapTotalWidth;
		let tileHalfLengthTop = testTile.coords.right.y;
		let tileHalfLengthBottom = testTile.coords.bottom.y - testTile.coords.right.y;
		let mapLengthTop = tileHalfLengthTop * mapTotalWidth;
		let mapLengthBottom = tileHalfLengthBottom * mapTotalLength;
		let mapWidthPx = Math.round((tileHalfWidthLeft + tileHalfWidthRight) * (mapTotalWidth ));
		let mapLengthPx = Math.round(mapLengthTop + mapLengthBottom);

		let html = '<svg width="'+mapWidthPx+'" height="'+mapLengthPx+'">';

		let lastTile = null;
		let startTileX = tileHalfWidthLeft * (mapTotalWidth - 1);

		for (let y = 0; y < mapTotalLength; y++) {

			for (let x = 0; x < mapTotalWidth; x++) {

				let thisPosY = 0;
				let thisPosX = 0;

				if (x === 0 && y === 0) {
					thisPosX = startTileX;
				}

				if (lastTile != null) {
					thisPosY = lastTile.coords.right.y;
				}

				if (y > 0 && x === 0) {
					thisPosX = startTileX - (tileHalfWidthLeft * y);
					thisPosY = (tileHalfLengthTop * y) - (yDeviation * y);
				}	
				
				if (x > 0) {
					thisPosX = (lastTile.coords.right.x - (lastTile.coords.right.x - lastTile.coords.bottom.x));
				}

				let newTile = this.createTile(thisPosX, thisPosY);

				html += newTile.html;

				lastTile = newTile;
			}
		}

		html += '</svg>';

		return html
	}

	createTile(xPos: number, yPos: number): TileTemplate {

		let tileW = this.config.tileWidth;
		let tileL = this.config.tileLength;

		let tileColor = `#${this.config.groundColor}`;

		let dimensions = this.calculations.calculateStraightLinesFromIsometricSquare(tileW, tileL);

		let top: Position = { "x": (xPos + dimensions.horizontalWidthFromTop), "y": yPos};
		let left: Position = { "x": xPos, "y": (yPos + dimensions.verticalHeightFromTop) };
		let bottom: Position = { "x": (xPos + dimensions.horizontalWidthFromBottom), "y": (yPos + dimensions.totalHeight) };
		let right: Position = { "x": (xPos + dimensions.totalWidth), "y": (yPos + dimensions.verticalHeightFromBottom) };

		let pointTop = `${top.x} ${top.y}`;
		let pointLeft = `${left.x} ${left.y}`;
		let pointBottom = `${bottom.x} ${bottom.y}`;
		let pointRight = `${right.x} ${right.y}`;

		var html = `<path fill="${tileColor}"
					d="M${pointLeft} 
					L${pointBottom} 
					L${pointRight} 
					L${pointTop} 
					L${pointLeft} Z" />`;

		let coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right };

		return { html: html, coords: coords }
	}
}
