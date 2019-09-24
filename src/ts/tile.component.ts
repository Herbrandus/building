import { Color } from './mapGenerationFunctions.component'

export class Tile {
	
	_id: number
	_x: number
	_y: number
	_h: number
	_tileType: TileType
	_tileColor: Color
	_options?: TileOptions

	constructor(			
			id: number,
			x: number,
			y: number,
			h: number,
			tileType: TileType,
			tileColor: Color,
			options?: TileOptions)
	{
		this._id = id
		this._x = x
		this._y = y
		this._h = h
		this._tileType = tileType
		this._tileColor = tileColor

		if (options) {
			this._options = options
		}
	}

	get id(): number {
		return this._id
	}

	get x(): number {
		return this._x
	}

	get y(): number {
		return this._y
	}

	get h(): number {
		return this._h
	}

	get type(): TileType {
		return this._tileType
	}

	get options(): TileOptions | undefined {
		if (this._options) {
			return this._options
		} else {
			return undefined
		}
	}

	public getColor(): Color {
		return this._tileColor
	}

	get tileColor(): Color {
		return this._tileColor
	}

	set tileColor(color: Color) {
		this._tileColor = color
	}

	set type(type: TileType) {
		this._tileType = type
	}
}

export interface TileOptions {
	roof: boolean,
	pillar: boolean,
	slope: boolean,
	windowed: number,
	tower: boolean,
	stairs:	boolean,
	halfArch: boolean,
	wholeArch: boolean
}

export enum TileType {
	None = 'none',
	Body = 'body',
	Tower = 'tower',
	HalfBlock = 'halfBlock',
	Roof = 'roof',
	Grass = 'grass',
	Shadow = 'shadow'
}
