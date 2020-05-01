import { Config } from './config.component'
import { MapGenerationFunctions } from './mapGenerationFunctions.component'
import { Color } from './colors.component'
import { Tile } from './tile.component'
import { TileType } from './enums/tile-type.enum'
import { Coords } from './interfaces/coords.interface'
import { TileTemplate } from './interfaces/tiletemplate.interface'
import { Position } from './interfaces/position.interface'
import { Column } from './column.component'
import { ColumnEdge } from './interfaces/column-edge.interface'

export class RenderElements {

	private config: Config = new Config()
	private calculations: MapGenerationFunctions = new MapGenerationFunctions()

	private tileW: number = this.config.tileWidth
	private tileL: number = this.config.tileLength
	private tileH: number = this.config.tileHeight
	private bleed: number = this.config.tileEdgeBleed
	private _maxDarken: number = this.config.maxDarkenValue
	private _maxLighten: number = this.config.maxLightenValue
	private dimensions = this.calculations.calculateStraightLinesFromIsometricSquare(this.tileW, this.tileL)

	private tileColor: Color = this.config.groundColor

	getPositions(xPos: number, yPos: number, topMargin: number = 0) {		
		const top: Position = { "x": xPos + this.dimensions.horizontalWidthFromTop, "y": yPos + topMargin }
		const left: Position = { "x": xPos, "y": yPos + this.dimensions.verticalHeightFromTop + topMargin }
		const bottom: Position = { "x": xPos + this.dimensions.horizontalWidthFromBottom, "y": yPos + this.dimensions.totalHeight + topMargin }
		const right: Position = { "x": xPos + this.dimensions.totalWidth, "y": yPos + this.dimensions.verticalHeightFromBottom + topMargin }

		return { top, left, bottom, right }
	}

	createTile(xPos: number, yPos: number, shadow: string): TileTemplate {

		const { top, left, bottom, right } = this.getPositions(xPos, yPos, 0)

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

	createPlane(xPos: number, yPos: number, tile: Tile, color: Color = this.config.groundColor): TileTemplate {

		const id = tile.id
		const height = (tile.h * this.tileH) - this.tileH

		let regularColor = color.hex()

		const { top, left, bottom, right } = this.getPositions(xPos, yPos, this.config.topMargin)

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

	createBlock(xPos: number, yPos: number, tile: Tile, topTile: boolean | string = false): TileTemplate {

		const id = tile.id
		const height = (tile.h * this.tileH) - this.tileH

		let regularColor
		let highlight
		let darkestColor
		let patternColor

		if (tile.tileColor.hex() !== this.config.buildingBaseColor.hex()) {
			regularColor = tile.tileColor.hex()
			highlight = tile.tileColor.changeColorLightingString(this._maxLighten)
			darkestColor = tile.tileColor.changeColorLightingString(this._maxDarken)
			patternColor = tile.tileColor.changeColorLightingString(15)
		} else {
			regularColor = this.config.buildingBaseColor.hex()
			highlight = this.config.buildingBaseColor.changeColorLightingString(this._maxLighten)
			darkestColor = this.config.buildingBaseColor.changeColorLightingString(this._maxDarken)
			patternColor = this.config.buildingBaseColor.changeColorLightingString(15)
		}

		const { top, left, bottom, right } = this.getPositions(xPos, yPos, this.config.topMargin)

		const leftWallLeftTop = `${left.x-this.bleed} ${left.y-height-this.tileH}`
		const leftWallLeftBottom = `${left.x-this.bleed} ${left.y-height+this.bleed}`
		const leftWallRightBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
		const leftWallRightTop = `${bottom.x} ${bottom.y-height-this.tileH}`

		const rightWallLeftTop = `${bottom.x} ${bottom.y-height-this.tileH}`
		const rightWallLeftBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
		const rightWallRightBottom = `${right.x+this.bleed} ${right.y-height+this.bleed}`
		const rightWallRightTop = `${right.x+this.bleed} ${right.y-height-this.tileH}`

		const blockTopLeft = `${left.x-this.bleed} ${left.y-height-this.tileH}`
		const blockTopBottom = `${bottom.x} ${bottom.y-height-this.tileH}`
		const blockTopRight = `${right.x+this.bleed} ${right.y-height-this.tileH}`
		const blockTopTop = `${top.x} ${top.y-height-this.tileH}`

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
					L${rightWallLeftTop} Z" />`

		if (topTile === 'triangles') {

			const margin = 2;

			const blockTopTileLeft = `${left.x-this.bleed+margin} ${left.y-height-this.tileH}`
			const blockTopTileBottom = `${bottom.x} ${bottom.y-height-this.tileH-(margin/2)}`
			const blockTopTileRight = `${right.x+this.bleed-margin} ${right.y-height-this.tileH}`
			const blockTopTileTop = `${top.x} ${top.y-height-this.tileH+(margin/1.5)}`

			const blockTopCenter = { x: left.x + ((right.x - left.x) / 2), y: (top.y + ((bottom.y - top.y) / 2)) }

			const blockTopCenterLeftMargin = `${blockTopCenter.x - (margin /2)} ${blockTopCenter.y}`
			const blockTopCenterBottomMargin = `${blockTopCenter.x} ${blockTopCenter.y + (margin /2)}`
			const blockTopCenterRightMargin = `${blockTopCenter.x + (margin /2)} ${blockTopCenter.y}`
			const blockTopCenterTopMargin = `${blockTopCenter.x} ${blockTopCenter.y - (margin /2)}`

			const blockTopLeftTopCenter = `${left.x + ((top.x - left.x) / 2)} ${top.y + ((left.y - top.y) / 2) - height - this.tileH}`
			const blockTopLeftBottomCenter = `${left.x + ((bottom.x - left.x) / 2)} ${bottom.y - ((bottom.y - left.y) / 2) - height - this.tileH}`
			const blockTopRightBottomCenter = `${right.x - ((right.x - bottom.x) / 2)} ${bottom.y - ((right.y - top.y) / 2) - height - this.tileH}`
			const blockTopRightTopCenter = `${right.x - ((right.x - top.x) / 2)} ${right.y + ((bottom.y - right.y) / 2) - height - this.tileH}`

			html += `<path fill="${highlight}"
					d="M${blockTopLeft} 
					L${blockTopBottom} 
					L${blockTopRight} 
					L${blockTopTop} 
					L${blockTopLeft} Z" />
					<path fill="transparent" stroke="${patternColor}" stroke-linecap="round"
					d="M${blockTopLeft} 
					L${blockTopBottom} 
					L${blockTopRight} 
					L${blockTopTop} 
					L${blockTopLeft} Z" />
					<path fill="transparent" stroke="${patternColor}" stroke-linecap="round"
					d="M${blockTopLeft} 
					L${blockTopRight}" />
					<path fill="transparent" stroke="${patternColor}" stroke-linecap="round"
					d="M${blockTopTop} 
					L${blockTopBottom}" />`

		} else if (topTile === 'circles') {

			const margin = 2;

			const blockTopTileLeft = `${left.x-this.bleed+margin} ${left.y-height-this.tileH}`
			const blockTopTileBottom = `${bottom.x} ${bottom.y-height-this.tileH-(margin/2)}`
			const blockTopTileRight = `${right.x+this.bleed-margin} ${right.y-height-this.tileH}`
			const blockTopTileTop = `${top.x} ${top.y-height-this.tileH+(margin/1.5)}`

			const blockTopCenter = { x: left.x + ((right.x - left.x) / 2), y: (top.y + ((bottom.y - top.y) / 2))-height-this.tileH }

			const blockTopCenterLeftMargin = `${blockTopCenter.x - (margin /2)} ${blockTopCenter.y}`
			const blockTopCenterBottomMargin = `${blockTopCenter.x} ${blockTopCenter.y + (margin /2)}`
			const blockTopCenterRightMargin = `${blockTopCenter.x + (margin /2)} ${blockTopCenter.y}`
			const blockTopCenterTopMargin = `${blockTopCenter.x} ${blockTopCenter.y - (margin /2)}`

			const blockTopLeftTopCenter = `${left.x + ((top.x - left.x) / 2)} ${top.y + ((left.y - top.y) / 2) - height - this.tileH}`
			const blockTopLeftBottomCenter = `${left.x + ((bottom.x - left.x) / 2)} ${bottom.y - ((bottom.y - left.y) / 2) - height - this.tileH}`
			const blockTopRightBottomCenter = `${right.x - ((right.x - bottom.x) / 2)} ${bottom.y - ((right.y - top.y) / 2) - height - this.tileH}`
			const blockTopRightTopCenter = `${right.x - ((right.x - top.x) / 2)} ${right.y + ((bottom.y - right.y) / 2) - height - this.tileH}`

			const circleRadiusY = (bottom.y - top.y) / 4
			const circleRadiusX = (bottom.y - top.y) / 3

			html += `<path fill="${highlight}"
					d="M${blockTopLeft} 
					L${blockTopBottom} 
					L${blockTopRight} 
					L${blockTopTop} 
					L${blockTopLeft} Z" />
					<path fill="transparent" stroke="${patternColor}" stroke-linecap="round"
					d="M${blockTopLeft} 
					L${blockTopBottom} 
					L${blockTopRight} 
					L${blockTopTop} 
					L${blockTopLeft} Z" />
					<path fill="transparent" stroke="${patternColor}" stroke-linecap="round"
					d="M${blockTopLeft} 
					L${blockTopRight}" />
					<path fill="transparent" stroke="${patternColor}" stroke-linecap="round"
					d="M${blockTopTop} 
					L${blockTopBottom}" />
					<ellipse cx="${blockTopCenter.x}" cy="${blockTopCenter.y}" rx="${circleRadiusX}" ry="${circleRadiusY}" fill="transparent" stroke="${patternColor}" stroke-linecap="round" />`

		} else if (topTile === 'squares') {

			const margin = 2;

			const blockTopTileLeft = `${left.x-this.bleed+margin} ${left.y-height-this.tileH}`
			const blockTopTileBottom = `${bottom.x} ${bottom.y-height-this.tileH-(margin/2)}`
			const blockTopTileRight = `${right.x+this.bleed-margin} ${right.y-height-this.tileH}`
			const blockTopTileTop = `${top.x} ${top.y-height-this.tileH+(margin/1.5)}`

			const blockTopCenter = { x: left.x + ((right.x - left.x) / 2), y: (top.y + ((bottom.y - top.y) / 2)) }

			const blockTopCenterLeftMargin = `${blockTopCenter.x - (margin /2)} ${blockTopCenter.y}`
			const blockTopCenterBottomMargin = `${blockTopCenter.x} ${blockTopCenter.y + (margin /2)}`
			const blockTopCenterRightMargin = `${blockTopCenter.x + (margin /2)} ${blockTopCenter.y}`
			const blockTopCenterTopMargin = `${blockTopCenter.x} ${blockTopCenter.y - (margin /2)}`

			const blockTopLeftTopCenter = `${left.x + ((top.x - left.x) / 2)} ${top.y + ((left.y - top.y) / 2) - height - this.tileH}`
			const blockTopLeftBottomCenter = `${left.x + ((bottom.x - left.x) / 2)} ${bottom.y - ((bottom.y - left.y) / 2) - height - this.tileH}`
			const blockTopRightBottomCenter = `${right.x - ((right.x - bottom.x) / 2)} ${bottom.y - ((right.y - top.y) / 2) - height - this.tileH}`
			const blockTopRightTopCenter = `${right.x - ((right.x - top.x) / 2)} ${right.y + ((bottom.y - right.y) / 2) - height - this.tileH}`

			html += `<path fill="${highlight}"
					d="M${blockTopLeft} 
					L${blockTopBottom} 
					L${blockTopRight} 
					L${blockTopTop} 
					L${blockTopLeft} Z" />
					<path fill="transparent" stroke="${patternColor}" stroke-linecap="round"
					d="M${blockTopLeft} 
					L${blockTopBottom} 
					L${blockTopRight} 
					L${blockTopTop} 
					L${blockTopLeft} Z" />`
		} else {

			html += `<path fill="${highlight}"
					d="M${blockTopLeft} 
					L${blockTopBottom} 
					L${blockTopRight} 
					L${blockTopTop} 
					L${blockTopLeft} Z" />`
		}
					
		html +=	`</g>`

		const coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right }

		return { html: html, coords: coords }
	}

	createHalfBlock(xPos: number, yPos: number, tile: Tile): TileTemplate {

		const id = tile.id
		const height = (tile.h * this.tileH) - this.tileH

		let regularColor
		let highlight
		let darkestColor
		let strokeColor

		if (tile.tileColor.hex() !== this.config.buildingBaseColor.hex()) {
			regularColor = tile.tileColor.hex()
			highlight = tile.tileColor.changeColorLightingString(this._maxLighten)
			darkestColor = tile.tileColor.changeColorLightingString(this._maxDarken)
			strokeColor = tile.tileColor.changeColorLightingString(10)
		} else {
			regularColor = this.config.buildingBaseColor.hex()
			highlight = this.config.buildingBaseColor.changeColorLightingString(this._maxLighten)
			darkestColor = this.config.buildingBaseColor.changeColorLightingString(this._maxDarken)
			strokeColor = this.config.buildingBaseColor.changeColorLightingString(10)
		}	

		const { top, left, bottom, right } = this.getPositions(xPos, yPos, this.config.topMargin)

		const leftWallLeftTop = `${left.x-this.bleed} ${left.y-height-(this.tileH / 2)}`
		const leftWallLeftBottom = `${left.x-this.bleed} ${left.y-height+this.bleed}`
		const leftWallRightBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
		const leftWallRightTop = `${bottom.x} ${bottom.y-height-(this.tileH / 2)}`

		const rightWallLeftTop = `${bottom.x} ${bottom.y-height-(this.tileH / 2)}`
		const rightWallLeftBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
		const rightWallRightBottom = `${right.x+this.bleed} ${right.y-height+this.bleed}`
		const rightWallRightTop = `${right.x+this.bleed} ${right.y-height-(this.tileH / 2)}`

		const blockTopLeft = `${left.x-this.bleed} ${left.y-height-(this.tileH / 2)}`
		const blockTopBottom = `${bottom.x} ${bottom.y-height-(this.tileH / 2)}`
		const blockTopRight = `${right.x+this.bleed} ${right.y-height-(this.tileH / 2)}`
		const blockTopTop = `${top.x} ${top.y-height-(this.tileH / 2)}`

		const blockTopCenter = `${(left.x + ((right.x - left.x) / 2))} ${(top.y + ((bottom.y - top.y) / 2))}`

		const html = `<g style="z-index:${id};"><path fill="${darkestColor}"
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
					<path fill="transparent" stroke="${strokeColor}" stroke-linecap="round"
					d="M${blockTopRight}
					L${blockTopLeft}
					L${blockTopBottom}
					L${blockTopTop}" />
					</g>`

		const coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right }

		return { html: html, coords: coords }
	}

	createSlopeBlock(xPos: number, yPos: number, tile: Tile, slopeDirection: string): TileTemplate {

		const id = tile.id
		const height = (tile.h * this.tileH) - this.tileH
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
			regularLighterColor = tile.tileColor.changeColorLightingString(this._maxLighten / 3)
			shadowLight = tile.tileColor.changeColorLightingString(-20)
			shadowHighlight = tile.tileColor.changeColorLightingString(20)
			shadow = tile.tileColor.changeColorLightingString(this._maxDarken / 2)
			highlight = tile.tileColor.changeColorLightingString(this._maxLighten)
			almostDarkestColor = tile.tileColor.changeColorLightingString(-40)
			almostLightestColor = tile.tileColor.changeColorLightingString(40)
			darkestColor = tile.tileColor.changeColorLightingString(this._maxDarken)
			lightestColor = tile.tileColor.changeColorLightingString(this._maxLighten * 2)
		} else {
			regularColor = this.config.buildingBaseColor.hex()
			regularDarkerColor = this.config.buildingBaseColor.changeColorLightingString(-10)
			regularLighterColor = this.config.buildingBaseColor.changeColorLightingString(this._maxLighten / 3)
			shadowLight = this.config.buildingBaseColor.changeColorLightingString(-20)
			shadowHighlight = this.config.buildingBaseColor.changeColorLightingString(20)
			shadow = this.config.buildingBaseColor.changeColorLightingString(this._maxDarken / 2)
			highlight = this.config.buildingBaseColor.changeColorLightingString(this._maxLighten)
			almostDarkestColor = this.config.buildingBaseColor.changeColorLightingString(-40)
			almostLightestColor = this.config.buildingBaseColor.changeColorLightingString(40)
			darkestColor = this.config.buildingBaseColor.changeColorLightingString(this._maxDarken)
			lightestColor = this.config.buildingBaseColor.changeColorLightingString(this._maxLighten * 2)
		}

		const { top, left, bottom, right } = this.getPositions(xPos, yPos)

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
			highlight = tile.tileColor.changeColorLightingString(this._maxLighten)
			darkestColor = tile.tileColor.changeColorLightingString(this._maxDarken)
		} else {
			regularColor = this.config.buildingBaseColor.hex()
			highlight = this.config.buildingBaseColor.changeColorLightingString(this._maxLighten)
			darkestColor = this.config.buildingBaseColor.changeColorLightingString(this._maxDarken)
		}	

		const { top, left, bottom, right } = this.getPositions(xPos, yPos, this.config.topMargin)

		const leftWallLeftTop = `${left.x-this.bleed + (tileWidth / 2.7)} ${left.y-height-this.tileH}`
		const leftWallLeftBottom = `${left.x-this.bleed + (tileWidth / 2.7)} ${left.y-height}`

		const rightWallRightBottom = `${right.x+this.bleed - (tileWidth / 2.7)} ${right.y-height}`
		const rightWallRightTop = `${right.x+this.bleed - (tileWidth / 2.7)} ${right.y-height-this.tileH}`

		const leftWallBezier = `${left.x-this.bleed + (tileWidth / 2.7) + (tileWidth / 12)} ${bottom.y-height}`
		const rightWallBezier = `${right.x-this.bleed - (tileWidth / 2.7) - (tileWidth / 12)} ${bottom.y-height}`

		const blockTopLeft = `${left.x-this.bleed} ${left.y-height-this.tileH}`
		const blockTopBottom = `${bottom.x} ${bottom.y-height-this.tileH}`
		const blockTopRight = `${right.x+this.bleed} ${right.y-height-this.tileH}`
		const blockTopTop = `${top.x} ${top.y-height-this.tileH}`

		let html = `<g style="z-index:${id};">
			<defs>${this.calculations.addGradient("pillarGradient", darkestColor, regularColor)}</defs> 
			<path fill="url(#pillarGradient)"
			 d="M${leftWallLeftTop} 
			L${leftWallLeftBottom} 
			C${leftWallBezier}, ${rightWallBezier}, ${rightWallRightBottom} 
			L${rightWallRightTop} 
			L${leftWallLeftTop} Z" />
			
			</g>`

		let coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right }

		return { html: html, coords: coords }
	}

	createWindow(xPos: number, yPos: number, tile: Tile, columnInfo: Column, windowLights: boolean): TileTemplate {

		let id = tile.id
		let height = (tile.h * this.tileH) - this.tileH
		let regularColor = '#222'
		let darkestColor = '#111'
		let light = '#f3ef76'

		const { top, left, bottom, right } = this.getPositions(xPos, yPos, this.config.topMargin)

		let coords: Coords = { top: top, left: left, bottom: bottom, right: right }

		let windowBorderWidth = (top.x - left.x) / 10

		let html = `<g style="z-index:${id+columnInfo.height};">`

		if (columnInfo.edge.bottom) {

			const xEdge = (bottom.x - left.x) / 3
			const yEdge = (bottom.y - left.y) / 8

			const leftWindowLeftTop = `${left.x + xEdge} ${left.y - height - this.tileH + (yEdge * 7)}`
			const leftWindowLeftBottom = `${left.x + xEdge} ${left.y - height + (yEdge)}`
			const leftWindowRightBottom = `${bottom.x - xEdge} ${bottom.y - height - (yEdge * 4)}`
			const leftWindowRightTop = `${bottom.x - xEdge} ${bottom.y - height - this.tileH + (yEdge * 2)}`
			const leftWindowRightBezier = `${bottom.x - xEdge} ${bottom.y - height - this.tileH - yEdge}`
			const leftWindowLeftBezier = `${left.x + xEdge} ${left.y - height - this.tileH + (yEdge * 4)}`

			let windowColor = darkestColor
			if (windowLights) {
				let windowColor = (Math.round(Math.random() * 20) > 18) ? light : darkestColor
			}		

			html += `<path fill="${windowColor}"
						d="M${leftWindowLeftTop} 
						L${leftWindowLeftBottom} 
						L${leftWindowRightBottom} 
						L${leftWindowRightTop} 
						C${leftWindowRightBezier}, ${leftWindowLeftBezier}, ${leftWindowLeftTop} Z" />`
		}

		
		if (columnInfo.edge.right) {

			const xEdge = (right.x - bottom.x) / 3
			const yEdge = (right.y - bottom.y) / 8

			const rightWindowLeftTop = `${bottom.x + xEdge} ${bottom.y - height - this.tileH - (yEdge * 2)}`
			const rightWindowLeftBottom = `${bottom.x + xEdge} ${bottom.y - height + (yEdge * 3.6)}`
			const rightWindowRightBottom = `${right.x - xEdge} ${right.y - height - (yEdge * 1)}`
			const rightWindowRightTop = `${right.x - xEdge} ${right.y - height - this.tileH - (yEdge * 6.5)}`
			const rightWindowRightBezier = `${right.x - xEdge} ${right.y - height - this.tileH - (yEdge * 3.2)}`
			const rightWindowLeftBezier = `${bottom.x + xEdge} ${bottom.y - height - this.tileH + (yEdge * 0.3)}`
			
			let windowColor = regularColor
			if (windowLights) {
				let windowColor = (Math.round(Math.random() * 20) > 18) ? light : regularColor
			}	

			html += `<path fill="${windowColor}"
						d="M${rightWindowLeftTop} 
						L${rightWindowLeftBottom} 
						L${rightWindowRightBottom} 
						L${rightWindowRightTop} 
						C${rightWindowRightBezier}, ${rightWindowLeftBezier}, ${rightWindowLeftTop} Z" />`
		}

		html += `</g>`		

		return { html: html, coords: coords }
	}

	createDoor(xPos: number, yPos: number, tile: Tile, columnInfo: Column, direction?: string): TileTemplate {

		const id = tile.id
		const height = (tile.h * this.tileH) - this.tileH
		let regularColor
		let darkestColor
		let doorHandleColor

		if (tile.tileColor.hex() !== this.config.buildingBaseColor.hex()) {
			doorHandleColor = new Color(tile.tileColor.hex()).getColorByHue(110).changeColorLightingString(60)
			regularColor = new Color(tile.tileColor.hex()).getColorByHue(220).changeColorLightingString(-80)
			darkestColor = new Color(tile.tileColor.hex()).getColorByHue(220).changeColorLightingString(-110)
		} else {
			doorHandleColor = new Color(this.config.buildingBaseColor.hex()).getColorByHue(110).changeColorLightingString(60)
			regularColor = new Color(this.config.buildingBaseColor.hex()).getColorByHue(220).changeColorLightingString(-80)
			darkestColor = new Color(this.config.buildingBaseColor.hex()).getColorByHue(220).changeColorLightingString(-110)
		}

		const { top, left, bottom, right } = this.getPositions(xPos, yPos, this.config.topMargin)

		const coords: Coords = { top: top, left: left, bottom: bottom, right: right }

		const windowBorderWidth = (top.x - left.x) / 10

		let html = `<g style="z-index:${id+columnInfo.height};">`

		if (direction === 'bottom') {

			let xEdge = (bottom.x - left.x) / 4
			let yEdge = (bottom.y - left.y) / 8

			console.log(yEdge)

			const leftWindowLeftTop = `${left.x + xEdge} ${left.y - height - this.tileH + (yEdge * 4.5)}`
			const leftWindowLeftBottom = `${left.x + xEdge} ${left.y - height + (yEdge * 2)}`
			const leftWindowRightBottom = `${bottom.x - xEdge} ${bottom.y - height - (yEdge * 2)}`
			const leftWindowRightTop = `${bottom.x - xEdge} ${bottom.y - height - this.tileH + (yEdge * 0.5)}`

			const leftWindowBorderLeftTop = `${left.x + xEdge} ${left.y - height - this.tileH + (yEdge * 4.5)}`
			const leftWindowBorderRightBottom = `${bottom.x - xEdge} ${bottom.y - height - (yEdge * 2)}`
			const leftWindowBorderRightTop = `${bottom.x - xEdge} ${bottom.y - height - this.tileH + (yEdge * 0.5)}`

			html += `<path stroke="#111" stroke-width="1.3"
						d="M${leftWindowBorderLeftTop}
						L${leftWindowBorderRightTop}
						L${leftWindowBorderRightBottom}" />
					<path fill="${darkestColor}"
						d="M${leftWindowLeftTop} 
						L${leftWindowLeftBottom} 
						L${leftWindowRightBottom} 
						L${leftWindowRightTop} 
						L${leftWindowLeftTop} Z" />
					<circle fill="${doorHandleColor}" 
						cx="${left.x + (xEdge * 1.4)}" 
						cy="${bottom.y - height - this.tileH + (yEdge * 2.8)}" 
						r="0.8" />`
		}

		
		if (direction === 'right') {

			const xEdge = (right.x - bottom.x) / 4
			const yEdge = (right.y - bottom.y) / 8

			const rightWindowLeftTop = `${bottom.x + xEdge} ${bottom.y - height - this.tileH - (yEdge)}`
			const rightWindowLeftBottom = `${bottom.x + xEdge} ${bottom.y - height + (yEdge * 2)}`
			const rightWindowRightBottom = `${right.x - xEdge} ${right.y - height - (yEdge * 1.5)}`
			const rightWindowRightTop = `${right.x - xEdge} ${right.y - height - this.tileH - (yEdge * 4.5)}`

			html += `<path stroke="#444" stroke-width="1.3"
						d="M${rightWindowRightTop}
						L${rightWindowLeftTop}
						L${rightWindowLeftBottom}" />
					<path fill="${regularColor}"
						d="M${rightWindowLeftTop} 
						L${rightWindowLeftBottom} 
						L${rightWindowRightBottom} 
						L${rightWindowRightTop} 
						L${rightWindowLeftTop} Z" />
					<circle fill="${doorHandleColor}" 
						cx="${bottom.x + (xEdge * 1.3)}" 
						cy="${bottom.y - height - this.tileH - (yEdge * 4.5)}" 
						r="0.8" />`
		}

		html += `</g>`		

		return { html: html, coords: coords }
	}

	createHalfArch(xPos: number, yPos: number, tile: Tile, orientation: string): TileTemplate {

		const id = tile.id
		const height = (tile.h * this.tileH) - this.tileH
		let regularColor
		let darkestColor
		let highlight
		let highlightLeft
		let highlightRight
		let html

		if (tile.tileColor.hex() !== this.config.buildingBaseColor.hex()) {
			regularColor = tile.tileColor.hex()
			highlight = tile.tileColor.changeColorLightingString(this._maxLighten)
			darkestColor = tile.tileColor.changeColorLightingString(this._maxDarken)
			highlightLeft = tile.tileColor.changeColorLightingString(this._maxLighten / 2)
			highlightRight = tile.tileColor.changeColorLightingString(this._maxLighten)
		} else {
			regularColor = this.config.buildingBaseColor.hex()
			highlight = this.config.buildingBaseColor.changeColorLightingString(this._maxLighten)
			darkestColor = this.config.buildingBaseColor.changeColorLightingString(this._maxDarken)
			highlightLeft = this.config.buildingBaseColor.changeColorLightingString(this._maxLighten / 2)
			highlightRight = this.config.buildingBaseColor.changeColorLightingString(this._maxLighten)
		}

		const { top, left, bottom, right } = this.getPositions(xPos, yPos, this.config.topMargin)

		const halfTileWidth = ((right.x - bottom.x) / 3)

		if (orientation === 'right-bottom') {

			const leftWallLeftTop = `${left.x-this.bleed} ${left.y-height-this.tileH}`
			const leftWallLeftBottom = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			const leftWallRightBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			const leftWallRightTop = `${bottom.x} ${bottom.y-height-this.tileH}`

			const rightWallLeftTop = `${bottom.x} ${bottom.y-height-this.tileH}`
			const rightWallLeftBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			const rightWallLeftBottomBezier = `${bottom.x} ${bottom.y-height-(this.tileH * 0.5)}`
			const rightWallRightTopBezier = `${bottom.x + (halfTileWidth*0.4)} ${bottom.y-height-this.tileH}`
			const rightWallRightTop = `${right.x+this.bleed} ${right.y-height-this.tileH}`

			const blockTopLeft = `${left.x-this.bleed} ${left.y-height-this.tileH}`
			const blockTopBottom = `${bottom.x} ${bottom.y-height-this.tileH}`
			const blockTopRight = `${right.x+this.bleed} ${right.y-height-this.tileH}`
			const blockTopTop = `${top.x} ${top.y-height-this.tileH}`

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

			const leftWallLeftTop = `${left.x-this.bleed} ${left.y-height-this.tileH}`
			const leftWallLeftBottom = `${left.x-this.bleed} ${left.y-height+this.bleed}`
			const leftWallRightBottom = `${bottom.x} ${bottom.y-height+this.bleed}`
			const leftWallRightTop = `${bottom.x} ${bottom.y-height-this.tileH}`

			const rightWallLeftTop = `${bottom.x} ${bottom.y-height-this.tileH}`
			const rightWallLeftTopBezier = `${right.x+this.bleed-(halfTileWidth*0.3)} ${right.y-height-(this.tileH*0.7)}`
			const rightWallRightBottomBezier = `${right.x} ${right.y-height-(this.tileH*0.4)}`
			const rightWallRightBottom = `${right.x+this.bleed} ${right.y-height+this.bleed}`
			const rightWallRightTop = `${right.x+this.bleed} ${right.y-height-this.tileH}`

			const blockTopLeft = `${left.x-this.bleed} ${left.y-height-this.tileH}`
			const blockTopBottom = `${bottom.x} ${bottom.y-height-this.tileH}`
			const blockTopRight = `${right.x+this.bleed} ${right.y-height-this.tileH}`
			const blockTopTop = `${top.x} ${top.y-height-this.tileH}`

			const blockBackRightBottom = `${right.x+this.bleed} ${right.y-height+this.bleed}`
			const blockBackLeftBottom = `${right.x+this.bleed} ${right.y-height-this.tileH}`
			const blockBackLeftTop = `${top.x-this.bleed} ${top.y-height-this.tileH}`
			const blockBackRightTop = `${top.x-this.bleed} ${top.y-height}`

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

		const coords: Coords = { top: top, left: left, bottom: bottom, right: right }

		return { html: html, coords: coords }
	}

	createTowerTop(left: Position, bottom: Position, right: Position, top: Position, height: number, tile: Tile) {

		let regularColor
		let highlightLeft
		let highlightRight
		let html

		if (tile.tileColor.hex() !== this.config.buildingBaseColor.hex()) {
			regularColor = tile.tileColor.hex()
			highlightLeft = tile.tileColor.changeColorLightingString(-25)
			highlightRight = tile.tileColor.changeColorLightingString(this._maxLighten / 2)
		} else {
			regularColor = this.config.buildingBaseColor.hex()
			highlightLeft = this.config.buildingBaseColor.changeColorLightingString(-25)
			highlightRight = this.config.buildingBaseColor.changeColorLightingString(this._maxLighten / 2)
		}

		const centerTop = {
			x: left.x + ((right.x - left.x) / 2),
			y: left.y - (this.tileH * height)
		}

		html = `<g id="towerTop_${tile.id}">
				<path fill="${highlightLeft}"
					d="M${left.x} ${left.y+this.bleed}
					L${bottom.x} ${bottom.y+this.bleed}
					L${centerTop.x} ${centerTop.y}
					L${left.x} ${left.y+this.bleed} Z" 
				/>
				<path fill="${highlightRight}"
					d="M${bottom.x} ${bottom.y+this.bleed}
					L${right.x} ${right.y+this.bleed}
					L${centerTop.x} ${centerTop.y}
					L${bottom.x} ${bottom.y+this.bleed} Z" 
				/>
			</g>`

		return html
	}


	createTree(xPos: number, yPos: number) {

		const x = xPos
		const y = yPos

		const darkGreen = '#007c36'
		const lightGreen = '#5fb875'
		const darkBrown = '#443422'
		const lightBrown = '#664c2c'
		const shadowFull = '#00000744'
		const shadowEmpty = '#02001e00'

		const treeHtml = `
		<defs>${this.calculations.addGradient("woodGradient", darkBrown, lightBrown)}</defs> 
		<defs>${this.calculations.addGradient("leafGradient", darkGreen, lightGreen)}</defs>
		<defs>${this.calculations.addGradient("shadow", shadowEmpty, shadowFull)}</defs>
			<path fill="url(#woodGradient)" 
			d="M${x+34.3} ${y+89.4}
			l-0.4 21.3
			c0,0,0.2 3.9,4.2 3.9
			c3.4 0 3.5-4.4 3.5-4.4
			l-0.5-20.8
			L${x+34.3} ${y+89.4} z"/>			
			<path fill="url(#leafGradient)"
			d="M${x+38.6} ${y+32.8}
			c-9.9 0-18.5 20-18.5 39.7
			s12.4 23.1 18.1 23.1
			s17.8-4.3 17.8-23.2
			S${x+45.5} ${y+32.8} ${x+38.6} ${y+32.8} z"/>
			<polygon fill="url(#shadow)" 
			points="${x+34.8} ${y+111} ${x+25.7} ${y+115.7} ${x+32.8} ${y+118.8} ${x+41} ${y+113}"/>`

		return { html: treeHtml }
	}
}