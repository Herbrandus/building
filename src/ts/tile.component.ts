import { Color } from './mapGenerationFunctions.component'

export class Tile {
	
	_id: number
	_x: number
	_y: number
	_h: number
	_tileType: TileType
	_tileColor: Color
	_options?: object = {}

	constructor(			
			id: number,
			x: number,
			y: number,
			h: number,
			tileType: TileType,
			tileColor: Color,
			options?: object)
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

	get options(): object {
		if (this._tileType != TileType.None) {
			return this._options
		} else {
			return { 'defined': false }
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

}

export enum TileType {
	None = 'none',
	Body = 'body',
	Tower = 'tower',
	Roof = 'roof'
}
