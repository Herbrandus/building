export class Config {

	private _tileWidth: number = 35
	private _tileLength: number = 35
	private _tileHeight: number = 20
	private _tileSmallAngle: number = 80
	private _tileLargeAngle: number = 100
	private _groundColor: string = 'dbc'

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

	public get groundColor(): string {
		return this._groundColor
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