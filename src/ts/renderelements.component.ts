import { Config, Coords, TileTemplate, Position } from './config.component'
import { MapGenerationFunctions, Color } from './mapGenerationFunctions.component'
import { Tile, TileType } from './tile.component'
import { Column, ColumnEdge } from './mapper.component'

export class RenderElements {

	private config: Config = new Config()
	private calculations: MapGenerationFunctions = new MapGenerationFunctions()

	private tileW: number = this.config.tileWidth
	private tileL: number = this.config.tileLength
	private tileH: number = this.config.tileHeight
	private bleed: number = this.config.tileEdgeBleed
	private dimensions = this.calculations.calculateStraightLinesFromIsometricSquare(this.tileW, this.tileL)

	private tileColor: Color = this.config.groundColor

	createTile(xPos: number, yPos: number, shadow: string): TileTemplate {

		let top: Position = { "x": (xPos + this.dimensions.horizontalWidthFromTop), "y": yPos}
		let left: Position = { "x": xPos, "y": (yPos + this.dimensions.verticalHeightFromTop) }
		let bottom: Position = { "x": (xPos + this.dimensions.horizontalWidthFromBottom), "y": (yPos + this.dimensions.totalHeight) }
		let right: Position = { "x": (xPos + this.dimensions.totalWidth), "y": (yPos + this.dimensions.verticalHeightFromBottom) }

		let pointTop = `${top.x} ${top.y-this.bleed}`
		let pointLeft = `${left.x-this.bleed} ${left.y}`
		let pointBottom = `${bottom.x} ${bottom.y+this.bleed}`
		let pointRight = `${right.x+this.bleed} ${right.y}`

		let tileColor = this.tileColor.hex()
		if (shadow === 'shade') {
			tileColor = this.tileColor.changeColorLightingString(-50)
		}

		var html = `<path fill="${tileColor}"
					d="M${pointLeft} 
					L${pointBottom} 
					L${pointRight} 
					L${pointTop} 
					L${pointLeft} Z" />`

		let coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right }

		return { html: html, coords: coords }
	}

	createPlane(xPos: number, yPos: number, tile: Tile, color?: Color): TileTemplate {

		let id = tile.id
		let height = (tile.h * this.tileH) - this.tileH

		let regularColor

		if (color) {
			regularColor = color.hex()
		} else {
			regularColor = this.config.groundColor.hex()
		}

		let top: Position = { "x": Math.ceil(xPos + this.dimensions.horizontalWidthFromTop), "y": Math.ceil(yPos + this.config.topMargin ) }
		let left: Position = { "x": Math.ceil(xPos), "y": Math.ceil(yPos + this.dimensions.verticalHeightFromTop + this.config.topMargin ) }
		let bottom: Position = { "x": Math.ceil(xPos + this.dimensions.horizontalWidthFromBottom), "y": Math.ceil(yPos + this.dimensions.totalHeight + this.config.topMargin ) }
		let right: Position = { "x": Math.ceil(xPos + this.dimensions.totalWidth), "y": Math.ceil(yPos + this.dimensions.verticalHeightFromBottom + this.config.topMargin ) }

		let blockTopLeft = `${left.x-this.bleed} ${left.y}`
		let blockTopBottom = `${bottom.x} ${bottom.y}`
		let blockTopRight = `${right.x+this.bleed} ${right.y}`
		let blockTopTop = `${top.x} ${top.y}`

		let html = `<g style="z-index:${id};">
					<path fill="${regularColor}"
					d="M${blockTopLeft} 
					L${blockTopBottom} 
					L${blockTopRight} 
					L${blockTopTop} 
					L${blockTopLeft} Z" /></g>`

		let coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right }

		return { html: html, coords: coords }
	}

	createBlock(xPos: number, yPos: number, tile: Tile): TileTemplate {

		let id = tile.id
		let height = (tile.h * this.tileH) - this.tileH

		let regularColor
		let highlight
		let darkestColor

		if (tile.tileColor.hex() !== this.config.buildingBaseColor.hex()) {
			regularColor = tile.tileColor.hex()
			highlight = tile.tileColor.changeColorLightingString(30)
			darkestColor = tile.tileColor.changeColorLightingString(-60)
		} else {
			regularColor = this.config.buildingBaseColor.hex()
			highlight = this.config.buildingBaseColor.changeColorLightingString(30)
			darkestColor = this.config.buildingBaseColor.changeColorLightingString(-60)
		}

		let top: Position = { x: Math.ceil(xPos + this.dimensions.horizontalWidthFromTop), y: Math.ceil(yPos + this.config.topMargin ) }
		let left: Position = { x: Math.ceil(xPos), y: Math.ceil(yPos + this.dimensions.verticalHeightFromTop + this.config.topMargin ) }
		let bottom: Position = { x: Math.ceil(xPos + this.dimensions.horizontalWidthFromBottom), y: Math.ceil(yPos + this.dimensions.totalHeight + this.config.topMargin ) }
		let right: Position = { x: Math.ceil(xPos + this.dimensions.totalWidth), y: Math.ceil(yPos + this.dimensions.verticalHeightFromBottom + this.config.topMargin ) }

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

		let html = `<g style="z-index:${id};">
					<path fill="${darkestColor}"
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
					<path fill="${highlight}"
					d="M${blockTopLeft} 
					L${blockTopBottom} 
					L${blockTopRight} 
					L${blockTopTop} 
					L${blockTopLeft} Z" />
				</g>`

		let coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right }

		return { html: html, coords: coords }
	}

	createHalfBlock(xPos: number, yPos: number, tile: Tile): TileTemplate {

		let id = tile.id
		let height = (tile.h * this.tileH) - this.tileH

		let regularColor
		let highlight
		let darkestColor

		if (tile.tileColor.hex() !== this.config.buildingBaseColor.hex()) {
			regularColor = tile.tileColor.hex()
			highlight = tile.tileColor.changeColorLightingString(30)
			darkestColor = tile.tileColor.changeColorLightingString(-60)
		} else {
			regularColor = this.config.buildingBaseColor.hex()
			highlight = this.config.buildingBaseColor.changeColorLightingString(30)
			darkestColor = this.config.buildingBaseColor.changeColorLightingString(-60)
		}	

		let top: Position = { "x": Math.ceil(xPos + this.dimensions.horizontalWidthFromTop), "y": Math.ceil(yPos + this.config.topMargin ) }
		let left: Position = { "x": Math.ceil(xPos), "y": Math.ceil(yPos + this.dimensions.verticalHeightFromTop + this.config.topMargin ) }
		let bottom: Position = { "x": Math.ceil(xPos + this.dimensions.horizontalWidthFromBottom), "y": Math.ceil(yPos + this.dimensions.totalHeight + this.config.topMargin ) }
		let right: Position = { "x": Math.ceil(xPos + this.dimensions.totalWidth), "y": Math.ceil(yPos + this.dimensions.verticalHeightFromBottom + this.config.topMargin ) }

		let leftWallLeftTop = `${left.x-this.bleed} ${left.y-height-(this.tileH / 2)}`
		let leftWallLeftBottom = `${left.x-this.bleed} ${left.y-height+this.bleed}`
		let leftWallRightBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
		let leftWallRightTop = `${bottom.x} ${bottom.y-height-(this.tileH / 2)}`

		let rightWallLeftTop = `${bottom.x} ${bottom.y-height-(this.tileH / 2)}`
		let rightWallLeftBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
		let rightWallRightBottom = `${right.x+this.bleed} ${right.y-height+this.bleed}`
		let rightWallRightTop = `${right.x+this.bleed} ${right.y-height-(this.tileH / 2)}`

		let blockTopLeft = `${left.x-this.bleed} ${left.y-height-(this.tileH / 2)}`
		let blockTopBottom = `${bottom.x} ${bottom.y-height-(this.tileH / 2)}`
		let blockTopRight = `${right.x+this.bleed} ${right.y-height-(this.tileH / 2)}`
		let blockTopTop = `${top.x} ${top.y-height-(this.tileH / 2)}`

		let html = `<g style="z-index:${id};"><path fill="${darkestColor}"
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
					<path fill="${highlight}"
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
		let regularColor: string
		let regularDarkerColor: string
		let regularLighterColor: string
		let shadowLight: string
		let shadowHighlight: string
		let shadow: string
		let highlight: string
		let almostDarkestColor: string
		let almostLightestColor: string
		let darkestColor: string
		let lightestColor: string

		if (tile.tileColor.hex() !== this.config.buildingBaseColor.hex()) {
			regularColor = tile.tileColor.hex()
			regularDarkerColor = tile.tileColor.changeColorLightingString(-10)
			regularLighterColor = tile.tileColor.changeColorLightingString(10)
			shadowLight = tile.tileColor.changeColorLightingString(-20)
			shadowHighlight = tile.tileColor.changeColorLightingString(20)
			shadow = tile.tileColor.changeColorLightingString(-30)
			highlight = tile.tileColor.changeColorLightingString(30)
			almostDarkestColor = tile.tileColor.changeColorLightingString(-40)
			almostLightestColor = tile.tileColor.changeColorLightingString(40)
			darkestColor = tile.tileColor.changeColorLightingString(-60)
			lightestColor = tile.tileColor.changeColorLightingString(50)
		} else {
			regularColor = this.config.buildingBaseColor.hex()
			regularDarkerColor = this.config.buildingBaseColor.changeColorLightingString(-10)
			regularLighterColor = this.config.buildingBaseColor.changeColorLightingString(10)
			shadowLight = this.config.buildingBaseColor.changeColorLightingString(-20)
			shadowHighlight = this.config.buildingBaseColor.changeColorLightingString(20)
			shadow = this.config.buildingBaseColor.changeColorLightingString(-30)
			highlight = this.config.buildingBaseColor.changeColorLightingString(30)
			almostDarkestColor = this.config.buildingBaseColor.changeColorLightingString(-40)
			almostLightestColor = this.config.buildingBaseColor.changeColorLightingString(40)
			darkestColor = this.config.buildingBaseColor.changeColorLightingString(-60)
			lightestColor = this.config.buildingBaseColor.changeColorLightingString(50)
		}

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
							<path fill="${shadow}"
							d="M${leftWallLeftTop} 
							L${leftWallLeftBottom} 
							L${leftWallRightBottom} 
							L${leftWallRightTop} 
							L${leftWallLeftTop} Z" />
							<path fill="${regularColor}"
							d="M${rightWallLeftTop}
							L${rightWallLeftBottom}
							L${rightWallRightBottom}
							L${rightWallLeftTop} Z" />
							<path fill="${lightestColor}"
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
							<path fill="${darkestColor}"
							d="M${leftWallLeftTop}
							L${leftWallLeftBottom}
							L${leftWallRightBottom}
							L${leftWallLeftTop} Z" />
							<path fill="${regularDarkerColor}"
							d="M${blockTopLeft}
							L${blockTopBottom}
							L${blockTopTop}
							L${blockTopLeft} Z" />
							<path fill="${lightestColor}"
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
							<path fill="${regularColor}"
							d="M${rightWallLeftBottom}
							L${rightWallRightBottom}
							L${rightWallRightTop}
							L${rightWallLeftBottom} Z" />
							<path fill="${shadow}"
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
						<path fill="${shadow}"
						d="M${blockLeftLeft}
						L${blockLeftBottom}
						L${blockLeftTop}
						L${blockLeftLeft} Z" />
						<path fill="${regularDarkerColor}"
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
							<path fill="${darkestColor}"
							d="M${leftWallLeftTop}
							L${leftWallLeftBottom}
							L${leftWallRightBottom}
							L${leftWallLeftTop} Z" />
							<path fill="${regularDarkerColor}"
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
						<path fill="${darkestColor}"
						d="M${leftWallLeftTop}
						L${leftWallLeftBottom}
						L${leftWallRightBottom}
						L${leftWallLeftTop} Z" />
						<path fill="${regularDarkerColor}"
						d="M${blockTopLeft}
						L${blockTopBottom}
						L${blockTopRight}
						L${blockTopLeft} Z" />
						<path fill="${lightestColor}"
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
							<path fill="${darkestColor}"
							d="M${leftWallLeftTop}
							L${leftWallLeftBottom}
							L${leftWallRightBottom}
							L${leftWallLeftTop} Z" />
							<path fill="${regularDarkerColor}"
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
							<path fill="${regularColor}"
							d="M${rightWallLeftBottom}
							L${rightWallRightBottom}
							L${rightWallRightTop}
							L${rightWallLeftBottom} Z" />
							<path fill="${regularDarkerColor}"
							d="M${blockTopLeft}
							L${blockTopTop}
							L${blockTopRight}
							L${blockTopLeft} Z" />
							<path fill="${shadow}"
							d="M${blockTopLeft}
							L${blockTopBottom}
							L${blockTopRight}
							L${blockTopLeft} Z" />
						</g>`
		}

		return { html: html, coords: coords }
	}

	createPillarBlock(xPos: number, yPos: number, tile: Tile): TileTemplate {

		let id = tile.id
		let tileWidth = this.config.tileWidth
		let height = (tile.h * this.tileH) - this.tileH

		let regularColor
		let highlight
		let darkestColor

		if (tile.tileColor.hex() !== this.config.buildingBaseColor.hex()) {
			regularColor = tile.tileColor.hex()
			highlight = tile.tileColor.changeColorLightingString(30)
			darkestColor = tile.tileColor.changeColorLightingString(-60)
		} else {
			regularColor = this.config.buildingBaseColor.hex()
			highlight = this.config.buildingBaseColor.changeColorLightingString(30)
			darkestColor = this.config.buildingBaseColor.changeColorLightingString(-60)
		}	

		let top: Position = { "x": Math.ceil(xPos + this.dimensions.horizontalWidthFromTop), "y": Math.ceil(yPos + this.config.topMargin ) }
		let left: Position = { "x": Math.ceil(xPos), "y": Math.ceil(yPos + this.dimensions.verticalHeightFromTop + this.config.topMargin ) }
		let bottom: Position = { "x": Math.ceil(xPos + this.dimensions.horizontalWidthFromBottom), "y": Math.ceil(yPos + this.dimensions.totalHeight + this.config.topMargin ) }
		let right: Position = { "x": Math.ceil(xPos + this.dimensions.totalWidth), "y": Math.ceil(yPos + this.dimensions.verticalHeightFromBottom + this.config.topMargin ) }

		let leftWallLeftTop = `${left.x-this.bleed + (tileWidth / 3)} ${left.y-height-this.tileH}`
		let leftWallLeftBottom = `${left.x-this.bleed + (tileWidth / 3)} ${left.y-height}`

		let rightWallRightBottom = `${right.x+this.bleed - (tileWidth / 3)} ${right.y-height}`
		let rightWallRightTop = `${right.x+this.bleed - (tileWidth / 3)} ${right.y-height-this.tileH}`

		let leftWallBezier = `${left.x-this.bleed + (tileWidth / 3) + (tileWidth / 12)} ${bottom.y-height}`
		let rightWallBezier = `${right.x-this.bleed - (tileWidth / 3) - (tileWidth / 12)} ${bottom.y-height}`

		let blockTopLeft = `${left.x-this.bleed} ${left.y-height-this.tileH}`
		let blockTopBottom = `${bottom.x} ${bottom.y-height-this.tileH}`
		let blockTopRight = `${right.x+this.bleed} ${right.y-height-this.tileH}`
		let blockTopTop = `${top.x} ${top.y-height-this.tileH}`

		let html = `<g style="z-index:${id};">`
			html += `<defs>${this.calculations.addGradient("pillarGradient", darkestColor, regularColor)}</defs>` 
			html += `<path fill="url(#pillarGradient)"`
			html += ` d="M ${leftWallLeftTop} `
			html += `L ${leftWallLeftBottom} `
			html += `C ${leftWallBezier}, ${rightWallBezier}, ${rightWallRightBottom} `
			html += `L ${rightWallRightTop} `
			html += `L ${leftWallLeftTop} Z" /></g>`

		let coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right }

		return { html: html, coords: coords }
	}

	createWindow(xPos: number, yPos: number, tile: Tile, columnInfo: Column): TileTemplate {

		let id = tile.id
		let height = (tile.h * this.tileH) - this.tileH
		let regularColor
		let darkestColor
		let highlight
		let highlightLeft
		let highlightRight

		if (tile.tileColor.hex() !== this.config.buildingBaseColor.hex()) {
			regularColor = tile.tileColor.changeColorLightingString(-120)
			highlight = tile.tileColor.changeColorLightingString(30)
			darkestColor = tile.tileColor.changeColorLightingString(-140)
			highlightLeft = tile.tileColor.changeColorLightingString(15)
			highlightRight = tile.tileColor.changeColorLightingString(30)
		} else {
			regularColor = this.config.buildingBaseColor.changeColorLightingString(-120)
			highlight = this.config.buildingBaseColor.changeColorLightingString(30)
			darkestColor = this.config.buildingBaseColor.changeColorLightingString(-140)
			highlightLeft = this.config.buildingBaseColor.changeColorLightingString(15)
			highlightRight = this.config.buildingBaseColor.changeColorLightingString(30)
		}

		let top: Position = { x: Math.ceil(xPos + this.dimensions.horizontalWidthFromTop), y: Math.ceil(yPos + this.config.topMargin ) }
		let left: Position = { x: Math.ceil(xPos), y: Math.ceil(yPos + this.dimensions.verticalHeightFromTop + this.config.topMargin ) }
		let bottom: Position = { x: Math.ceil(xPos + this.dimensions.horizontalWidthFromBottom), y: Math.ceil(yPos + this.dimensions.totalHeight + this.config.topMargin ) }
		let right: Position = { x: Math.ceil(xPos + this.dimensions.totalWidth), y: Math.ceil(yPos + this.dimensions.verticalHeightFromBottom + this.config.topMargin ) }

		let coords: Coords = { top: top, left: left, bottom: bottom, right: right }

		let windowBorderWidth = (top.x - left.x) / 10

		let html = `<g style="z-index:${id+columnInfo.height};">`

		if (columnInfo.edge.bottom) {

			let xEdge = (bottom.x - left.x) / 3
			let yEdge = (bottom.y - left.y) / 8

			let leftWindowLeftTop = `${left.x + xEdge} ${left.y - height - this.tileH + (yEdge * 7)}`
			let leftWindowLeftBottom = `${left.x + xEdge} ${left.y - height + (yEdge)}`
			let leftWindowRightBottom = `${bottom.x - xEdge} ${bottom.y - height - (yEdge * 4)}`
			let leftWindowRightTop = `${bottom.x - xEdge} ${bottom.y - height - this.tileH + (yEdge * 2)}`
			let leftWindowRightBezier = `${bottom.x - xEdge} ${bottom.y - height - this.tileH - yEdge}`
			let leftWindowLeftBezier = `${left.x + xEdge} ${left.y - height - this.tileH + (yEdge * 4)}`

			html += `<path fill="#111"
						d="M${leftWindowLeftTop} 
						L${leftWindowLeftBottom} 
						L${leftWindowRightBottom} 
						L${leftWindowRightTop} 
						C${leftWindowRightBezier}, ${leftWindowLeftBezier}, ${leftWindowLeftTop} Z" />`
		}

		
		if (columnInfo.edge.right) {

			let xEdge = (right.x - bottom.x) / 3
			let yEdge = (right.y - bottom.y) / 8

			let rightWindowLeftTop = `${bottom.x + xEdge} ${bottom.y - height - this.tileH - (yEdge * 2)}`
			let rightWindowLeftBottom = `${bottom.x + xEdge} ${bottom.y - height + (yEdge * 3.6)}`
			let rightWindowRightBottom = `${right.x - xEdge} ${right.y - height - (yEdge * 1)}`
			let rightWindowRightTop = `${right.x - xEdge} ${right.y - height - this.tileH - (yEdge * 6.5)}`
			let rightWindowRightBezier = `${right.x - xEdge} ${right.y - height - this.tileH - (yEdge * 3.2)}`
			let rightWindowLeftBezier = `${bottom.x + xEdge} ${bottom.y - height - this.tileH + (yEdge * 0.3)}`

			html += `<path fill="#222"
						d="M${rightWindowLeftTop} 
						L${rightWindowLeftBottom} 
						L${rightWindowRightBottom} 
						L${rightWindowRightTop} 
						C${rightWindowRightBezier}, ${rightWindowLeftBezier}, ${rightWindowLeftTop} Z" />`
		}

		html += `</g>`		

		return { html: html, coords: coords }
	}

	createHalfArch(xPos: number, yPos: number, tile: Tile, orientation: string): TileTemplate {

		let id = tile.id
		let height = (tile.h * this.tileH) - this.tileH
		let regularColor
		let darkestColor
		let highlight
		let highlightLeft
		let highlightRight
		let html

		if (tile.tileColor.hex() !== this.config.buildingBaseColor.hex()) {
			regularColor = tile.tileColor.hex()
			highlight = tile.tileColor.changeColorLightingString(30)
			darkestColor = tile.tileColor.changeColorLightingString(-60)
			highlightLeft = tile.tileColor.changeColorLightingString(15)
			highlightRight = tile.tileColor.changeColorLightingString(30)
		} else {
			regularColor = this.config.buildingBaseColor.hex()
			highlight = this.config.buildingBaseColor.changeColorLightingString(30)
			darkestColor = this.config.buildingBaseColor.changeColorLightingString(-60)
			highlightLeft = this.config.buildingBaseColor.changeColorLightingString(15)
			highlightRight = this.config.buildingBaseColor.changeColorLightingString(30)
		}

		let top: Position = { x: Math.ceil(xPos + this.dimensions.horizontalWidthFromTop), y: Math.ceil(yPos + this.config.topMargin ) }
		let left: Position = { x: Math.ceil(xPos), y: Math.ceil(yPos + this.dimensions.verticalHeightFromTop + this.config.topMargin ) }
		let bottom: Position = { x: Math.ceil(xPos + this.dimensions.horizontalWidthFromBottom), y: Math.ceil(yPos + this.dimensions.totalHeight + this.config.topMargin ) }
		let right: Position = { x: Math.ceil(xPos + this.dimensions.totalWidth), y: Math.ceil(yPos + this.dimensions.verticalHeightFromBottom + this.config.topMargin ) }

		let halfTileWidth = ((right.x - bottom.x) / 3)

		if (orientation === 'right-bottom') {

			let leftWallLeftTop = `${left.x-this.bleed} ${left.y-height-this.tileH}`
			let leftWallLeftBottom = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			let leftWallRightBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			let leftWallRightTop = `${bottom.x} ${bottom.y-height-this.tileH}`

			let rightWallLeftTop = `${bottom.x} ${bottom.y-height-this.tileH}`
			let rightWallLeftBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			let rightWallLeftBottomBezier = `${bottom.x} ${bottom.y-height-(this.tileH * 0.5)}`
			let rightWallRightTopBezier = `${bottom.x + (halfTileWidth*0.4)} ${bottom.y-height-this.tileH}`
			let rightWallRightTop = `${right.x+this.bleed} ${right.y-height-this.tileH}`

			let blockTopLeft = `${left.x-this.bleed} ${left.y-height-this.tileH}`
			let blockTopBottom = `${bottom.x} ${bottom.y-height-this.tileH}`
			let blockTopRight = `${right.x+this.bleed} ${right.y-height-this.tileH}`
			let blockTopTop = `${top.x} ${top.y-height-this.tileH}`

			html = `<g style="z-index:${id};">
						<path fill="${darkestColor}"
						d="M${leftWallLeftTop} 
						L${leftWallLeftBottom} 
						L${leftWallRightBottom} 
						L${leftWallRightTop} 
						L${leftWallLeftTop} Z" />
						<path fill="${regularColor}"
						d="M${rightWallLeftTop} 
						L${rightWallLeftBottom}
						C${rightWallLeftBottomBezier}, ${rightWallRightTopBezier}, ${rightWallRightTop}
						L${rightWallLeftTop} Z" />
						<path fill="${highlight}"
						d="M${blockTopLeft} 
						L${blockTopBottom} 
						L${blockTopRight} 
						L${blockTopTop} 
						L${blockTopLeft} Z" />
					</g>`

		} 

		if (orientation === 'right-top') {

			let leftWallLeftTop = `${left.x-this.bleed} ${left.y-height-this.tileH}`
			let leftWallLeftBottom = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			let leftWallRightBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			let leftWallRightTop = `${bottom.x} ${bottom.y-height-this.tileH}`

			let rightWallLeftTop = `${bottom.x} ${bottom.y-height-this.tileH}`
			let rightWallLeftTopBezier = `${right.x+this.bleed-(halfTileWidth*0.3)} ${right.y-height-(this.tileH*0.7)}`
			let rightWallRightBottomBezier = `${right.x} ${right.y-height-(this.tileH*0.4)}`
			let rightWallRightBottom = `${right.x+this.bleed} ${right.y-height+this.bleed}`
			let rightWallRightTop = `${right.x+this.bleed} ${right.y-height-this.tileH}`

			let blockTopLeft = `${left.x-this.bleed} ${left.y-height-this.tileH}`
			let blockTopBottom = `${bottom.x} ${bottom.y-height-this.tileH}`
			let blockTopRight = `${right.x+this.bleed} ${right.y-height-this.tileH}`
			let blockTopTop = `${top.x} ${top.y-height-this.tileH}`

			let blockBackRightBottom = `${right.x+this.bleed} ${right.y-height+this.bleed}`
			let blockBackLeftBottom = `${right.x+this.bleed} ${right.y-height-this.tileH}`
			let blockBackLeftTop = `${top.x-this.bleed} ${top.y-height-this.tileH}`
			let blockBackRightTop = `${top.x-this.bleed} ${top.y-height}`

			html = `<g style="z-index:${id};">
						<path fill="${darkestColor}"
						d="M${blockBackRightBottom} 
						L${blockBackLeftBottom} 
						L${blockBackLeftTop} 
						L${blockBackRightTop} 
						L${blockBackRightBottom} Z" />
						<path fill="${regularColor}"
						d="M${rightWallLeftTop} 
						C${rightWallLeftTopBezier}, ${rightWallRightBottomBezier}, ${rightWallRightBottom}
						L${rightWallRightTop} 
						L${rightWallLeftTop} Z" />
						<path fill="${highlight}"
						d="M${blockTopLeft} 
						L${blockTopBottom} 
						L${blockTopRight} 
						L${blockTopTop} 
						L${blockTopLeft} Z" />
					</g>`
		}

		let coords: Coords = { top: top, left: left, bottom: bottom, right: right }

		return { html: html, coords: coords }
	}
}