import { Color } from './colors.component'

export class Config {

	private _allowDebug: boolean = true
	private _tileWidth: number = 16
	private _tileLength: number = 16
	private _tileHeight: number = 14
	private _tileSmallAngle: number = 85
	private _tileLargeAngle: number = 100
	private _groundColor: Color = new Color('#f5f3e5')
	private _buildingBaseColor: Color = new Color(
		125 + Math.floor(Math.random() * 75),
		125 + Math.floor(Math.random() * 40),
		160 + Math.floor(Math.random() * 30)
	)
	private _maxDarkenValue: number = -70
	private _maxLightenValue: number = 40
	private _tileEdgeBleed: number = 0.3
	private _maxAllowedHeight: number = 12
	private _topMargin: number = 80
	private _allowSurroundingDecorations: boolean = true
	private _allowWindows: boolean = false
	private _lightInWindows: boolean = Math.round(Math.random() * 8) > 6 ? true : false
	private _goldenRatio: number = 1.61803399
	private _fibonacci: number[] = [1, 2, 3, 5, 8, 13]

	constructor() {	}

	public get allowDebug(): boolean {
		return this._allowDebug
	}

	public get tileWidth(): number {
		return this._tileWidth
	}

	public get tileLength(): number {
		return this._tileLength
	}

	public get tileHeight(): number {
		return this._tileHeight
	}

	public get tileSmallAngle(): number {
		return this._tileSmallAngle
	}

	public get tileLargeAngle(): number {
		return this._tileLargeAngle
	}

	public get groundColor(): Color {
		return this._groundColor
	}

	public get buildingBaseColor(): Color {
		return this._buildingBaseColor
	}

	public get maxDarkenValue(): number {
		return this._maxDarkenValue
	}

	public get maxLightenValue(): number {
		return this._maxLightenValue
	}

	public get tileEdgeBleed(): number {
		return this._tileEdgeBleed
	}

	public get maxAllowedHeight(): number {
		return this._maxAllowedHeight
	}

	public get topMargin(): number {
		return this._topMargin
	}

	public get lightInWindows(): boolean {
		return this._lightInWindows
	}

	public get allowWindows(): boolean {
		return this._allowWindows
	}

	public get allowSurroundingDecorations(): boolean {
		return this._allowSurroundingDecorations
	}

	public get goldenRatio(): number {
		return this._goldenRatio
	}

	public get fibonacci(): number[] {
		return this._fibonacci
	}

	public getMapWidth(mapArrayWidth: number): number {
		return mapArrayWidth * this._tileWidth
	}

	public getMapLength(mapArrayLength: number): number {
		return mapArrayLength * this._tileLength
	}
}