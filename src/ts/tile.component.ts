import { TileColor } from './mapGenerationFunctions.component'

export class Tile {
	
	_id: number
	_x: number
	_y: number
	_h: number
	_tileType: TileType
	_colorRed: TileColor
	_colorGreen: TileColor
	_colorBlue: TileColor
	_options?: object = {}

	constructor(			
			id: number,
			x: number,
			y: number,
			h: number,
			tileType: TileType,
			colorRed: TileColor,
			colorGreen: TileColor,
			colorBlue: TileColor,
			options?: object)
	{
		this._id = id
		this._x = x
		this._y = y
		this._h = h
		this._tileType = tileType
		this._colorRed = colorRed
		this._colorGreen = colorGreen
		this._colorBlue = colorBlue

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

	public getColor(): object {
		return {
			'r': this._colorRed,
			'g': this._colorGreen,
			'b': this._colorBlue
		}
	}

}

export enum TileType {
	None = 'none',
	Body = 'body',
	Tower = 'tower',
	Roof = 'roof'
}