import { TileColor } from './mapGenerationFunctions.component'

export class Tile {
	
	_id: number
	_x: number
	_y: number
	_h: number
	_tileType: TileType
	_blockGroup: number
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
			blockGroup: number,
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
		this._blockGroup = blockGroup
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

	get type(): TileType {
		return this._tileType
	}

	get blockGroup(): number {
		return this._blockGroup
	}

	get options(): object {
		if (this._tileType != TileType.None) {
			return this._options
		} else {
			return { 'defined': false }
		}
	}

}

export enum TileType {
	None = 'none',
	Body = 'body',
	Tower = 'tower',
	Roof = 'roof'
}