import { Color } from './mapGenerationFunctions.component'

export class Config {

	private _tileWidth: number = 35
	private _tileLength: number = 35
	private _tileHeight: number = 20
	private _tileSmallAngle: number = 85
	private _tileLargeAngle: number = 100
	private _groundColor: Color = new Color('f5f3e5')
	private _buildingBaseColor: Color = new Color(
		125 + Math.floor(Math.random() * 75),
		170 + Math.floor(Math.random() * 40),
		180 + Math.floor(Math.random() * 30)
	)
	private _tileEdgeBleed: number = 0

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

	public get tileEdgeBleed(): number {
		return this._tileEdgeBleed
	}

	public getMapWidth(mapArrayWidth: number): number {
		return mapArrayWidth * this._tileWidth
	}

	public getMapLength(mapArrayLength: number): number {
		return mapArrayLength * this._tileLength
	}
}

export interface Coords {
	top?: Position,
	left?: Position,
	bottom?: Position,
	right?: Position
}

export interface TileTemplate {
	html?: string,
	coords?: Coords
}

export interface Position {
	x?: number,
	y?: number
}
