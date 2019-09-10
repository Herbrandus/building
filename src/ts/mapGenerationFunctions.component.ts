import { Config } from './config.component'

export class MapGenerationFunctions {

	private config: Config = new Config();
	smallAngle = this.config.tileSmallAngle;
	largeAngle = this.config.tileLargeAngle;

	constructor() { }

	public calculateAdditionalBlockIterations(maximumBlockIterations: number) {
		return 2 + Math.floor(Math.random() * maximumBlockIterations);
	}

	public calculateTriangleHypotenuse(adjacent: number, opposite: number): number {
		let sum = Math.pow(adjacent, 2) + Math.pow(opposite, 2);
		let result = Math.sqrt(sum);
		return result
	}	

	// calculate the dimensions to draw the isometric perspective tile with the parameters as if it were a straight square tile
	public calculateStraightLinesFromIsometricSquare (blockWidth: number, blockHeight: number) {
		// lengths this function returns when it comes to positions of longest and shortest sides as array
		/*           [0]
		 *   _________________ 
		 *   |    [3]  |      |
		 *   | [5]            |
		 *   |               -|
		 *   |-               | [1]
		 *   | [4]            |
		 *   |    [2]         |
		 *   |_______|________|
		 */  

		let smallOuterAngle = (180 - this.smallAngle) / 2;
		let largeOuterAngle = (180 - this.largeAngle) / 2;

		let horizontalWidthFromBottom = this.getHorizontalBottomShortestWidth(blockWidth, smallOuterAngle);
		let verticalHeightFromBottom = this.getVerticalBottomShortestHeight(horizontalWidthFromBottom, smallOuterAngle);

		let horizontalWidthFromTop = this.getHorizontalTopLongestWidth(blockHeight, largeOuterAngle);
		let verticalHeightFromTop = this.getVerticalTopLongestHeight(horizontalWidthFromTop, largeOuterAngle);

		let totalHeight = verticalHeightFromBottom + verticalHeightFromTop;
		let totalWidth = horizontalWidthFromBottom + horizontalWidthFromTop;

		return {	'totalWidth': totalWidth, 
					'totalHeight': totalHeight, 
					'horizontalWidthFromBottom': horizontalWidthFromBottom, 
					'horizontalWidthFromTop': horizontalWidthFromTop, 
					'verticalHeightFromBottom': verticalHeightFromBottom, 
					'verticalHeightFromTop': verticalHeightFromTop }
	}

	// calculate the amount of pixels from the bottom left side of a straight square to the point at the bottom 
	// .. where the tip of the tile meets the border of the square
	public getHorizontalBottomShortestWidth (diagonalWidth: number, smallAngle: number): number {
		return Math.ceil((diagonalWidth * Math.sin(this.toRadians(smallAngle))) * 100) / 100;
	}

	public getVerticalBottomShortestHeight (diagonalHeight: number, smallAngle: number): number {
		return Math.ceil((diagonalHeight * Math.cos(this.toRadians(smallAngle))) * 100) / 100;
	}

	public getHorizontalTopLongestWidth (diagonalWidth: number, largeAngle: number): number {
		return Math.ceil((diagonalWidth * Math.sin(this.toRadians(largeAngle))) * 100) / 100;
	}

	public getVerticalTopLongestHeight (diagonalHeight: number, largeAngle: number): number {
		return Math.ceil(diagonalHeight * Math.cos(this.toRadians(largeAngle)));
	}

	toRadians (angle: number): number {
		return angle * (Math.PI / 180);
	}
}

export enum TileColor {
	Red = 125 + Math.floor(Math.random() * 75),
	Green = 170 + Math.floor(Math.random() * 40),
	Blue = 180 + Math.floor(Math.random() * 30)
}

export enum BuildingHeightVariations {
	TallCenter = 'tallCenter',
	TallSurrounds = 'tallSurrounds',
	Random = 'random'
}

export class Color {
	private _hexNames: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
	private _colorRgb: RGB
	private _colorHex: string

	constructor(...params: any[]) {
		let error = null
		if (params.length === 1) {
			if (typeof params[0] === 'string') {
				if (this.validateHex(params[0])) {
					let hexColor = params[0]
					if (hexColor.charAt(0) !== '#') {
						hexColor = `#${hexColor}`
					}
					this.setHex(hexColor)
					this.hexToRgb()
				} else {
					error = "Hexadecimal color is incorrect"
				}
			} else {
				error = "Length of 1 in parameters is not equal to string"
			}
		} else if (params.length === 3) {
			if (this.validateRgb(params)) {
				this.setRgb(params[0], params[1], params[2])
				this.rgbToHex()
			} else {
				error = "Values of RGB exceed limits"
			}
		}

		if (error !== null) {
			throw "Color type is incorrect. " + error + ": " + params.toString()
		}
	}

	public setRgb(r: number, g: number, b: number) {
		this._colorRgb = {r: r, g: g, b: b} as RGB
	}

	public setHex(hexadecimal: string) {
		if (hexadecimal.length < 7) {
			let hexVal1 = hexadecimal.charAt(1)
			let hexVal2 = hexadecimal.charAt(2)
			let hexVal3 = hexadecimal.charAt(3)
			hexadecimal = "#" + hexVal1 + hexVal1 + hexVal2 + hexVal2 + hexVal3 + hexVal3
		}
		this._colorHex = hexadecimal
	}

	public rgb(): RGB {
		return this._colorRgb
	}

	public hex(): string {
		return this._colorHex
	}

	validateRgb(rgb: number[]): boolean {
		if (rgb[0] > -1 && rgb[0] < 256 &&
			rgb[1] > -1 && rgb[1] < 256 &&
			rgb[2] > -1 && rgb[2] < 256) {
			return true
		} else {
			return false
		}
	}

	validateHex(hex: string): boolean {
		let regex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
		if (hex.match(regex)) {
			return true
		} else {
			return false
		}
	}

	hexToRgb() {
		let hexValues: string[] = this._colorHex.substr(1).split('')
		let hexPair1 = (this._hexNames.indexOf(hexValues[0]) * 16) + this._hexNames.indexOf(hexValues[1])
		let hexPair2 = (this._hexNames.indexOf(hexValues[2]) * 16) + this._hexNames.indexOf(hexValues[3])
		let hexPair3 = (this._hexNames.indexOf(hexValues[4]) * 16) + this._hexNames.indexOf(hexValues[5])
		this.setRgb(hexPair1, hexPair2, hexPair3)
		this.rgbToHex()
	}

	rgbToHex() {
		if (typeof this._colorRgb === 'object') {
			let r = this._colorRgb.r
			let b = this._colorRgb.b
			let g = this._colorRgb.g
			let hexR = Number(r).toString(16)
			let hexG = Number(g).toString(16)
			let hexB = Number(b).toString(16)
			this._colorHex = "#" + hexR + hexG + hexB
		}
	}
}

export interface RGB {
	r: 0,
	g: 0,
	b: 0
}
