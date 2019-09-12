import { Config, Coords, TileTemplate, Position } from './config.component'
import { MapGenerationFunctions, Color } from './mapGenerationFunctions.component'
import { Tile, TileType } from './tile.component'

export class RenderElements {

	private config: Config = new Config()
	private calculations: MapGenerationFunctions = new MapGenerationFunctions()

	private tileW: number = this.config.tileWidth
	private tileL: number = this.config.tileLength
	private tileH: number = this.config.tileHeight
	private bleed: number = this.config.tileEdgeBleed
	private dimensions = this.calculations.calculateStraightLinesFromIsometricSquare(this.tileW, this.tileL)

	private tileColor: string = this.config.groundColor.hex()
	private regularColor: string = this.config.buildingBaseColor.hex()
	/*
	private regularDarkerColor: string = `rgb(${this.config.buildingBaseColor.getDarkerRegularRGB().r},${this.config.buildingBaseColor.getDarkerRegularRGB().g},${this.config.buildingBaseColor.getDarkerRegularRGB().b})`
	private highlightColor: string = `rgb(${this.config.buildingBaseColor.getHighlightsRGB().r},${this.config.buildingBaseColor.getHighlightsRGB().g},${this.config.buildingBaseColor.getHighlightsRGB().b})`
	private shadowColor: string = `rgb(${this.config.buildingBaseColor.getShadowsRGB().r},${this.config.buildingBaseColor.getShadowsRGB().g},${this.config.buildingBaseColor.getShadowsRGB().b})`
	private halflightColor: string = `rgb(${this.config.buildingBaseColor.getHalflightsRGB().r},${this.config.buildingBaseColor.getHalflightsRGB().g},${this.config.buildingBaseColor.getHalflightsRGB().b})`
	private darkestColor: string = `rgb(${this.config.buildingBaseColor.getDarkestRGB().r},${this.config.buildingBaseColor.getDarkestRGB().g},${this.config.buildingBaseColor.getDarkestRGB().b})`
	private lightestColor: string = `rgb(${this.config.buildingBaseColor.getLightestRGB().r},${this.config.buildingBaseColor.getLightestRGB().g},${this.config.buildingBaseColor.getLightestRGB().b})`
	*/

	private regularDarkerColor: string = this.config.buildingBaseColor.changeColorLighting(-10, 'hex')
	private regularLighterColor: string = this.config.buildingBaseColor.changeColorLighting(10, 'hex')
	private shadowLight: string = this.config.buildingBaseColor.changeColorLighting(-20, 'hex')
	private shadowHighlight: string = this.config.buildingBaseColor.changeColorLighting(20, 'hex')
	private shadow: string = this.config.buildingBaseColor.changeColorLighting(-30, 'hex')
	private highlight: string = this.config.buildingBaseColor.changeColorLighting(30, 'hex')
	private almostDarkestColor: string = this.config.buildingBaseColor.changeColorLighting(-40, 'hex')
	private almostLightestColor: string = this.config.buildingBaseColor.changeColorLighting(40, 'hex')
	private darkestColor: string = this.config.buildingBaseColor.changeColorLighting(-50, 'hex')
	private lightestColor: string = this.config.buildingBaseColor.changeColorLighting(50, 'hex')


	createTile(xPos: number, yPos: number): TileTemplate {

		let top: Position = { "x": (xPos + this.dimensions.horizontalWidthFromTop), "y": yPos}
		let left: Position = { "x": xPos, "y": (yPos + this.dimensions.verticalHeightFromTop) }
		let bottom: Position = { "x": (xPos + this.dimensions.horizontalWidthFromBottom), "y": (yPos + this.dimensions.totalHeight) }
		let right: Position = { "x": (xPos + this.dimensions.totalWidth), "y": (yPos + this.dimensions.verticalHeightFromBottom) }

		let pointTop = `${top.x} ${top.y-this.bleed}`
		let pointLeft = `${left.x-this.bleed} ${left.y}`
		let pointBottom = `${bottom.x} ${bottom.y+this.bleed}`
		let pointRight = `${right.x+this.bleed} ${right.y}`

		var html = `<path fill="${this.tileColor}"
					d="M${pointLeft} 
					L${pointBottom} 
					L${pointRight} 
					L${pointTop} 
					L${pointLeft} Z" />`

		let coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right }

		return { html: html, coords: coords }
	}

	createBlock(xPos: number, yPos: number, tile: Tile): TileTemplate {

		let id = tile.id
		let height = (tile.h * this.tileH) - this.tileH

		let top: Position = { "x": Math.ceil(xPos + this.dimensions.horizontalWidthFromTop), "y": Math.ceil(yPos) }
		let left: Position = { "x": Math.ceil(xPos), "y": Math.ceil(yPos + this.dimensions.verticalHeightFromTop) }
		let bottom: Position = { "x": Math.ceil(xPos + this.dimensions.horizontalWidthFromBottom), "y": Math.ceil(yPos + this.dimensions.totalHeight) }
		let right: Position = { "x": Math.ceil(xPos + this.dimensions.totalWidth), "y": Math.ceil(yPos + this.dimensions.verticalHeightFromBottom) }

		let leftWallLeftTop = `${left.x-this.bleed} ${left.y-height-this.tileH}`
		let leftWallLeftBottom = `${left.x-this.bleed} ${left.y-height+this.bleed}`
		let leftWallRightBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
		let leftWallRightTop = `${bottom.x} ${bottom.y-height-this.tileH}`

		let rightWallLeftTop = `${bottom.x} ${bottom.y-height-this.tileH}`
		let rightWallLeftBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
		let rightWallRightBottom = `${right.x+this.bleed} ${right.y-height+this.bleed}`
		let rightWallRightTop = `${right.x+this.bleed} ${right.y-height-this.tileH}`

		let blockTopLeft = `${left.x-this.bleed} ${left.y-height-this.tileH}`
		let blockTopBottom = `${bottom.x} ${bottom.y-height-this.tileH}`
		let blockTopRight = `${right.x+this.bleed} ${right.y-height-this.tileH}`
		let blockTopTop = `${top.x} ${top.y-height-this.tileH}`

		let html = `<g style="z-index:${id};"><path fill="${this.darkestColor}"
					d="M${leftWallLeftTop} 
					L${leftWallLeftBottom} 
					L${leftWallRightBottom} 
					L${leftWallRightTop} 
					L${leftWallLeftTop} Z" />
					<path fill="${this.regularColor}"
					d="M${rightWallLeftTop} 
					L${rightWallLeftBottom} 
					L${rightWallRightBottom} 
					L${rightWallRightTop} 
					L${rightWallLeftTop} Z" />
					<path fill="${this.highlight}"
					d="M${blockTopLeft} 
					L${blockTopBottom} 
					L${blockTopRight} 
					L${blockTopTop} 
					L${blockTopLeft} Z" /></g>`

		let coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right }

		return { html: html, coords: coords }
	}

	createSlopeBlock(xPos: number, yPos: number, tile: Tile, slopeDirection: string): TileTemplate {

		let id = tile.id
		let height = (tile.h * this.tileH) - this.tileH

		let top: Position = { "x": Math.ceil(xPos + this.dimensions.horizontalWidthFromTop), "y": Math.ceil(yPos) }
		let left: Position = { "x": Math.ceil(xPos), "y": Math.ceil(yPos + this.dimensions.verticalHeightFromTop) }
		let bottom: Position = { "x": Math.ceil(xPos + this.dimensions.horizontalWidthFromBottom), "y": Math.ceil(yPos + this.dimensions.totalHeight) }
		let right: Position = { "x": Math.ceil(xPos + this.dimensions.totalWidth), "y": Math.ceil(yPos + this.dimensions.verticalHeightFromBottom) }

		let html = ''
		let coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right }

		if (slopeDirection === 'n') {

			let leftWallLeftTop = `${left.x-this.bleed} ${left.y-height-this.tileH}`
			let leftWallLeftBottom = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			let leftWallRightBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			let leftWallRightTop = `${bottom.x} ${bottom.y-height-this.tileH}`

			let rightWallLeftTop = `${bottom.x} ${bottom.y-height-this.tileH}`
			let rightWallLeftBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			let rightWallRightBottom = `${right.x+this.bleed} ${right.y-height+this.bleed}`

			let blockTopLeft = `${left.x-this.bleed} ${left.y-height-this.tileH}`
			let blockTopBottom = `${bottom.x} ${bottom.y-height-this.tileH}`
			let blockTopRight = `${right.x+this.bleed} ${right.y-height+this.bleed}`
			let blockTopTop = `${top.x} ${top.y-height}`

			html = `<g style="z-index:${id};">
							<path fill="${this.shadow}"
							d="M${leftWallLeftTop} 
							L${leftWallLeftBottom} 
							L${leftWallRightBottom} 
							L${leftWallRightTop} 
							L${leftWallLeftTop} Z" />
							<path fill="${this.regularColor}"
							d="M${rightWallLeftTop}
							L${rightWallLeftBottom}
							L${rightWallRightBottom}
							L${rightWallLeftTop} Z" />
							<path fill="${this.lightestColor}"
							d="M${blockTopLeft}
							L${blockTopBottom}
							L${blockTopRight}
							L${blockTopTop}
							L${blockTopLeft} Z" />
						</g>`
		}

		if (slopeDirection === 'nw') {

			console.log('northwest')

			let leftWallLeftTop = `${left.x-this.bleed} ${left.y-height}`
			let leftWallLeftBottom = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			let leftWallRightBottom = `${bottom.x} ${bottom.y-height-this.tileH+this.bleed}`

			let blockTopLeft = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			let blockTopBottom = `${bottom.x} ${bottom.y-height-this.tileH+this.bleed}`
			let blockTopTop = `${top.x} ${top.y-height}`

			let blockRightBottom = `${bottom.x} ${bottom.y-height-this.tileH}`
			let blockRightRight = `${right.x+this.bleed} ${right.y-height+this.bleed}`
			let blockRightTop = `${top.x} ${top.y-height}`

			html = `<g style="z-index:${id};">
							<path fill="${this.darkestColor}"
							d="M${leftWallLeftTop}
							L${leftWallLeftBottom}
							L${leftWallRightBottom}
							L${leftWallLeftTop} Z" />
							<path fill="${this.regularDarkerColor}"
							d="M${blockTopLeft}
							L${blockTopBottom}
							L${blockTopTop}
							L${blockTopLeft} Z" />
							<path fill="${this.lightestColor}"
							d="M${blockRightBottom}
							L${blockRightRight}
							L${blockRightTop}
							L${blockRightBottom} Z" />
						</g>`
		}

		if (slopeDirection === 's') {

			let rightWallLeftBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			let rightWallRightBottom = `${right.x+this.bleed} ${right.y-height+this.bleed}`
			let rightWallRightTop = `${right.x+this.bleed} ${right.y-height-this.tileH}`

			let blockTopLeft = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			let blockTopBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			let blockTopRight = `${right.x+this.bleed} ${right.y-height-this.tileH+this.bleed}`
			let blockTopTop = `${top.x} ${top.y-height-this.tileH}`

			html = `<g style="z-index:${id};">
							<path fill="${this.regularColor}"
							d="M${rightWallLeftBottom}
							L${rightWallRightBottom}
							L${rightWallRightTop}
							L${rightWallLeftBottom} Z" />
							<path fill="${this.shadow}"
							d="M${blockTopLeft}
							L${blockTopBottom}
							L${blockTopRight}
							L${blockTopTop}
							L${blockTopLeft} Z" />
						</g>`
		}

		if (slopeDirection === 'se') {

			let blockLeftLeft = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			let blockLeftBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			let blockLeftTop = `${top.x} ${top.y-height-this.tileH}`

			let blockRightBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			let blockRightRight = `${right.x+this.bleed} ${right.y-height+this.bleed}`
			let blockRightTop = `${top.x} ${top.y-height-this.tileH}`

			html = `<g style="z-index:${id};">
						<path fill="${this.shadow}"
						d="M${blockLeftLeft}
						L${blockLeftBottom}
						L${blockLeftTop}
						L${blockLeftLeft} Z" />
						<path fill="${this.regularDarkerColor}"
						d="M${blockRightRight}
						L${blockRightBottom}
						L${blockRightTop}
						L${blockRightRight} Z" />
					</g>`
		}

		if (slopeDirection === 'e') {

			let leftWallLeftTop = `${left.x-this.bleed} ${left.y-height-this.tileH}`
			let leftWallLeftBottom = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			let leftWallRightBottom = `${bottom.x} ${bottom.y-height+this.bleed}`

			let blockTopLeft = `${left.x-this.bleed} ${left.y-height-this.tileH+this.bleed}`
			let blockTopBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			let blockTopRight = `${right.x+this.bleed} ${right.y-height+this.bleed}`
			let blockTopTop = `${top.x} ${top.y-height-this.tileH}`

			html = `<g style="z-index:${id};">
							<path fill="${this.darkestColor}"
							d="M${leftWallLeftTop}
							L${leftWallLeftBottom}
							L${leftWallRightBottom}
							L${leftWallLeftTop} Z" />
							<path fill="${this.regularDarkerColor}"
							d="M${blockTopLeft}
							L${blockTopBottom}
							L${blockTopRight}
							L${blockTopTop}
							L${blockTopLeft} Z" />
						</g>`
		}

		if (slopeDirection === 'ne') {

			let leftWallLeftTop = `${left.x-this.bleed} ${left.y-height-this.tileH}`
			let leftWallLeftBottom = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			let leftWallRightBottom = `${bottom.x} ${bottom.y-height+this.bleed}`

			let blockBottomLeft = `${left.x-this.bleed} ${left.y-height-this.tileH+this.bleed}`
			let blockBottomRight = `${right.x+this.bleed} ${right.y-height+this.bleed}`
			let blockBottomTop = `${top.x} ${top.y-height}`

			let blockTopLeft = `${left.x-this.bleed} ${left.y-height-this.tileH+this.bleed}`
			let blockTopBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			let blockTopRight = `${right.x+this.bleed} ${right.y-height+this.bleed}`

			html = `<g style="z-index:${id};">
						<path fill="${this.darkestColor}"
						d="M${leftWallLeftTop}
						L${leftWallLeftBottom}
						L${leftWallRightBottom}
						L${leftWallLeftTop} Z" />
						<path fill="${this.regularDarkerColor}"
						d="M${blockTopLeft}
						L${blockTopBottom}
						L${blockTopRight}
						L${blockTopLeft} Z" />
						<path fill="${this.lightestColor}"
						d="M${blockBottomLeft}
						L${blockBottomTop}
						L${blockBottomRight}
						L${blockBottomLeft} Z" />
					</g>`
		}

		if (slopeDirection === 'w') {

			let leftWallLeftTop = `${left.x-this.bleed} ${left.y-height}`
			let leftWallLeftBottom = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			let leftWallRightBottom = `${bottom.x} ${bottom.y-height-this.tileH+this.bleed}`

			let blockTopLeft = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			let blockTopBottom = `${bottom.x} ${bottom.y-height-this.tileH+this.bleed}`
			let blockTopRight = `${right.x+this.bleed} ${right.y-height-this.tileH+this.bleed}`
			let blockTopTop = `${top.x} ${top.y-height}`

			html = `<g style="z-index:${id};">
							<path fill="${this.darkestColor}"
							d="M${leftWallLeftTop}
							L${leftWallLeftBottom}
							L${leftWallRightBottom}
							L${leftWallLeftTop} Z" />
							<path fill="${this.regularDarkerColor}"
							d="M${blockTopLeft}
							L${blockTopBottom}
							L${blockTopRight}
							L${blockTopTop}
							L${blockTopLeft} Z" />
						</g>`
		}

		if (slopeDirection === 'sw') {

			let rightWallLeftBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			let rightWallRightBottom = `${right.x+this.bleed} ${right.y-height+this.bleed}`
			let rightWallRightTop = `${right.x+this.bleed} ${right.y-height-this.tileH}`

			let blockTopLeft = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			let blockTopBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			let blockTopRight = `${right.x+this.bleed} ${right.y-height-this.tileH+this.bleed}`
			let blockTopTop = `${top.x} ${top.y-height}`

			html = `<g style="z-index:${id};">
							<path fill="${this.regularColor}"
							d="M${rightWallLeftBottom}
							L${rightWallRightBottom}
							L${rightWallRightTop}
							L${rightWallLeftBottom} Z" />
							<path fill="${this.regularDarkerColor}"
							d="M${blockTopLeft}
							L${blockTopTop}
							L${blockTopRight}
							L${blockTopLeft} Z" />
							<path fill="${this.shadow}"
							d="M${blockTopLeft}
							L${blockTopBottom}
							L${blockTopRight}
							L${blockTopLeft} Z" />
						</g>`
		}

		return { html: html, coords: coords }
	}
}