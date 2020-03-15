export class Color {
	private _colorRgb: RGB
	private _colorHex: string
	private _colorHsl: HSL

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
					this.convertToHSL()
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
				this.convertToHSL()
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

	public setHsl(h: number, s: number, l: number) {
		this._colorHsl = {h: h, s: s, l: l} as HSL
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

	public hsl(): HSL {
		return this._colorHsl
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
		let hexPair1 = parseInt(hexValues[0]+hexValues[1], 16)
		let hexPair2 = parseInt(hexValues[2]+hexValues[3], 16)
		let hexPair3 = parseInt(hexValues[4]+hexValues[5], 16)
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

	convertRGBtoHex(color: RGB): string {
		let r = color.r
		let b = color.b
		let g = color.g
		let hexR = Number(r).toString(16)
		let hexG = Number(g).toString(16)
		let hexB = Number(b).toString(16)
		return "#" + hexR + hexG + hexB
	}

	public changeColorLightingString(amount: number): string {
		let r = this._colorRgb.r
		let b = this._colorRgb.b
		let g = this._colorRgb.g
		let newR = r + amount
		let newG = g + amount
		let newB = b + (amount - 8)
		if (newR > 255) newR = 255
		if (newG > 255) newG = 255
		if (newR > 255) newR = 255

		let hexR = Number(newR).toString(16)
		let hexG = Number(newG).toString(16)
		let hexB = Number(newB).toString(16)
		let result = "#" + hexR + hexG + hexB

		return result
	}

	public changeColorLighting(amount: number): Color {
		let r = this._colorRgb.r
		let b = this._colorRgb.b
		let g = this._colorRgb.g
		let newR = r + amount
		let newG = g + amount
		let newB = b + (amount - 8)
		if (newR > 255) newR = 255
		if (newG > 255) newG = 255
		if (newR > 255) newR = 255
		
		this.setRgb(newR, newG, newR)
		this.rgbToHex()
		this.convertToHSL()

		return this
	}

	public getLightestRGB(): RGB {
		let r = this._colorRgb.r
		let b = this._colorRgb.b
		let g = this._colorRgb.g
		let newR = r + 55
		let newG = g + 55
		let newB = b + 40
		if (newR > 255) newR = 255
		if (newG > 255) newG = 255
		if (newR > 255) newR = 255
		return {r: newR, g: newG, b: newB}
	}

	public getHighlightsRGB(): RGB {
		let r = this._colorRgb.r
		let b = this._colorRgb.b
		let g = this._colorRgb.g
		let newR = r + 45
		let newG = g + 45
		let newB = b + 30
		if (newR > 255) newR = 255
		if (newG > 255) newG = 255
		if (newR > 255) newR = 255
		return {r: newR, g: newG, b: newB}
	}

	public getDarkerRegularRGB(): RGB {
		let r = this._colorRgb.r
		let b = this._colorRgb.b
		let g = this._colorRgb.g
		let newR = r + 15
		let newG = g + 15
		let newB = b + 5
		if (newR > 255) newR = 255
		if (newG > 255) newG = 255
		if (newR > 255) newR = 255
		return {r: newR, g: newG, b: newB}
	}

	public getHalflightsRGB(): RGB {
		let r = this._colorRgb.r
		let b = this._colorRgb.b
		let g = this._colorRgb.g
		let newR = r + 25
		let newG = g + 25
		let newB = b + 15
		if (newR > 255) newR = 255
		if (newG > 255) newG = 255
		if (newR > 255) newR = 255
		return {r: newR, g: newG, b: newB}
	}

	public getShadowsRGB(): RGB {
		let r = this._colorRgb.r
		let b = this._colorRgb.b
		let g = this._colorRgb.g
		let newR = r - 55
		let newG = g - 55
		let newB = b - 35
		if (newR < 0) newR = 0
		if (newG < 0) newG = 0
		if (newR < 0) newR = 0
		return {r: newR, g: newG, b: newB}
	}

	public getDarkestRGB(): RGB {
		let r = this._colorRgb.r
		let b = this._colorRgb.b
		let g = this._colorRgb.g
		let newR = r - 70
		let newG = g - 70
		let newB = b - 60
		if (newR < 0) newR = 0
		if (newG < 0) newG = 0
		if (newR < 0) newR = 0
		return {r: newR, g: newG, b: newB}
	}

	public getColorStringByHue(hue: number): string {

		let h = this._colorHsl.h,
			s = this._colorHsl.s,
			l = this._colorHsl.l

		let newHue = h + hue

		if (newHue > 360) {
			newHue = newHue % 360
		}

		let rgb = this.convertHSLtoRGB({h: newHue, s: s, l: l})

		return this.convertRGBtoHex(rgb)
	}

	public getColorByHue(hue: number): Color {

		let h = this._colorHsl.h,
			s = this._colorHsl.s,
			l = this._colorHsl.l

		let newHue = h + hue

		if (newHue > 360) {
			newHue = newHue % 360
		}

		let rgb = this.convertHSLtoRGB({h: newHue, s: s, l: l})

		this.setRgb(rgb.r, rgb.g, rgb.b)
		this.rgbToHex()

		return this
	}

	convertToHSL(): void {
		let r = this._colorRgb.r
		let b = this._colorRgb.b
		let g = this._colorRgb.g

		r /= 255
		g /= 255
		b /= 255

		let cmin = Math.min(r,g,b),
			cmax = Math.max(r,g,b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0

		// calculate hue
		if (delta === 0) {
			h = 0
		} else if (cmax === r) {
			h = ((g - b) / delta) % 6
		} else if (cmax === g) {
			h = (b - r) / delta + 2
		} else {
			h = (r - g) / delta + 4
		}

		h = Math.round(h * 60)

		if (h < 0) {
			h += 360
		}

		// calculate lightness
		l = (cmax + cmin) / 2 

		// calculate saturation
		s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

		s = +(s * 100).toFixed(1)
		l = +(l * 100).toFixed(1)

		this._colorHsl = { h: h, s: s, l: l }
	}

	convertHSLtoRGB(color: HSL): RGB {

		let h = color.h
		let s = color.s
		let l = color.l

		s /= 100
		l /= 100

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs((h / 60) % 2 - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0

		if (0 <= h && h < 60) {
			r = c; g = x; b = 0;
		} else if (60 <= h && h < 120) {
			r = x; g = c; b = 0;
		} else if (120 <= h && h < 180) {
			r = 0; g = c; b = x;
		} else if (180 <= h && h < 240) {
			r = 0; g = x; b = c;
		} else if (240 <= h && h < 300) {
			r = x; g = 0; b = c;
		} else if (300 <= h && h < 360) {
			r = c; g = 0; b = x;
		}
		
		r = Math.round((r + m) * 255)
		g = Math.round((g + m) * 255)
		b = Math.round((b + m) * 255)

		return {r: r, g: g, b: b}
	}
}

export interface RGB {
	r: number,
	g: number,
	b: number
}

export interface HSL {
	h: number,
	s: number,
	l: number
}