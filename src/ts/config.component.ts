export default class Config {

	private _tileWidth: number = 400
	private _tileLength: number = 400
	private _tileHeight: number = 20
	private _tileAngle: number = 20

	public get tileWidth(): number {
		return this._tileWidth
	}

	public get tileLength(): number {
		return this._tileLength
	}

	public get tileHeight(): number {
		return this._tileHeight
	}

	public get tileAngle(): number {
		return this._tileAngle
	}

	public getMapWidth(mapArrayWidth: number): number {
		return mapArrayWidth * this._tileWidth
	}

	public getMapLength(mapArrayLength: number): number {
		return mapArrayLength * this._tileLength
	}
}