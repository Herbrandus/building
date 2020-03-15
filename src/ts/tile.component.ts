import { Color } from './colors.component'
import { TileType } from './enums/tile-type.enum'
import { TileOptions } from './interfaces/tile-options.interface'

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