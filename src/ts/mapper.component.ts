import { MapGenerationFunctions, BuildingHeightVariations } from './mapGenerationFunctions.component'
import { Tile, TileType } from './tile.component'
import { Config } from './config.component'

export default class Map {

	private _mapWidth: number
	private _mapLength: number
	private _mapMaxHeight: number
	private _averageBuildingSize: number
	private _blockHeight: number
	private _maximumBlockIterations: number
	private _additionalBlockIterations: number
	private _mapEdgeWidth: number
	private _highestPoint: number
	private _startBlockXfromCenterDeviation: number
	private _world: any[][]
	private _blockHeightsArray: number[]
	private _blockGroupCollection: any[]
	private _blockGroups: any[]
	private _startBlockEdges: number[]
	private _additionalBlockEdges: number[]
	private _mapGen: MapGenerationFunctions = new MapGenerationFunctions()
	private config: Config = new Config()
	private _blockHeightVariationLabels = [BuildingHeightVariations.TallCenter, BuildingHeightVariations.TallSurrounds, BuildingHeightVariations.Random]
	private _blockHeightVariation = this._blockHeightVariationLabels[Math.floor(Math.random() * 3)]

	constructor(	
			mapWidth: number, 
			mapLength: number, 
			mapMaxHeight: number, 
			mapEdgeWidth: number,
			averageBuildingSize: number,
			blockHeight: number,
			maximumBlockIterations: number)
	{
		this._mapWidth = mapWidth
		this._mapLength = mapLength
		this._mapMaxHeight = mapMaxHeight
		this._mapEdgeWidth = mapEdgeWidth
		this._averageBuildingSize = averageBuildingSize
		this._blockHeight = blockHeight
		this._maximumBlockIterations = maximumBlockIterations
		this._additionalBlockIterations = this._mapGen.calculateAdditionalBlockIterations(maximumBlockIterations)
		this._blockGroups = []

		let mapLengthHalf = Math.floor(mapLength / 2)
		let mapWidthHalf = Math.floor(mapWidth / 2)
		let startBlockXfromCenterDeviation = 6
		let startblockLength = (this._averageBuildingSize + 1) + Math.floor(Math.random() * 6)
		let startblockWidth = this._averageBuildingSize + Math.floor(Math.random() * 5)
		let startblockXfromCenter = 6 + Math.floor(Math.random() * startBlockXfromCenterDeviation)
		let startblockLengthHalf = Math.floor(startblockLength / 2)
		let startblockWidthHalf = Math.floor(startblockWidth / 2)
		let startingPositionX = Math.floor(this._mapWidth / 2) - Math.floor(startblockXfromCenter / 2)

		this._world = []
		let i = 0
		let tileHeight = 0
		let firstBlockHeight

		if (this._blockHeightVariation == BuildingHeightVariations.TallCenter) {
			firstBlockHeight = blockHeight * 2
		} else if (this._blockHeightVariation == BuildingHeightVariations.TallSurrounds) {
			firstBlockHeight = 1 + Math.round(Math.random())
			blockHeight = firstBlockHeight
		} else {
			firstBlockHeight = blockHeight
		}

		console.log("Block height variation: " + this._blockHeightVariation)

		for (let y = 0; y < this.mapLength; y++) {

			this._world[y] = []

			for (let x = 0; x < this.mapWidth; x++) {

				let thisBlockGroup = 0

				let column = new Column(false, x, y, 0)

				if (y >= mapLengthHalf && y <= (mapLengthHalf + startblockLengthHalf) ) {

					if (x > startingPositionX && x <= (startingPositionX + startblockWidth) ) {

						thisBlockGroup = 1
						let tileStack = []

						for (let h = 0; h < firstBlockHeight; h++) {

							let thisPillar = 0
							let thisWindowed = 0
							let isRoof = (h === firstBlockHeight-1) ? true : false

							tileStack.push(
								new Tile(
									i, 
									x, 
									y, 
									h, 
									TileType.Body,
									this.config.buildingBaseColor,
									{
										'roof':			isRoof,
										'pillar': 		thisPillar,
										'windowed': 	thisWindowed,
										'tower': 		false
									})
								)

							if (this._blockGroups.indexOf(thisBlockGroup) === -1) {
								this._blockGroups[thisBlockGroup] = new Array( [y,x] )
							} else {
								this._blockGroups[thisBlockGroup].push([y,x])
							}

							i++
						}

						column = new Column(true, x, y, firstBlockHeight)

						column.blockGroup = thisBlockGroup
						column.height = firstBlockHeight
						column.corner = false
						column.tileStack = tileStack
					}
				}

				this._world[y][x] = column
			}
		}

		this.setEdges()
	}

	get mapWidth(): number {
		return this._mapWidth
	}

	get mapLength(): number {
		return this._mapLength
	}

	get map(): any[] {
		return this._world
	}

	public getColumn(x, y): Column {
		return this._world[y][x]
	}

	public getTiles(x, y): Tile[] {
		return this._world[y][x].tileStack
	}

	public getTile(x, y, h): Tile {
		return this._world[y][x].getTile(h)
	}

	public getTopTile(x, y): Tile {
		let height = this._world[y][x].height
		return this._world[y][x].getTile(height-1)
	}

	setEdges(): void {

		for (let y = 0; y < this.mapLength; y++) {
			for (let x = 0; x < this.mapWidth; x++) {
				
				if (y > 0 && x > 0 && y < this.mapLength-1 && x < this.mapWidth-1 && this._world[y][x].isDefined) {

					if (!this._world[y-1][x].isDefined) {
						this._world[y][x].edge.top = true
					}

					if (!this._world[y+1][x].isDefined) {
						this._world[y][x].edge.bottom = true
					}

					if (!this._world[y][x-1].isDefined) {
						this._world[y][x].edge.left = true
					}

					if (!this._world[y][x+1].isDefined) {
						this._world[y][x].edge.right = true
					}

					if ( (this._world[y][x].edge['top'] && this._world[y][x].edge['right']) ||
						 (this._world[y][x].edge['top'] && this._world[y][x].edge['left']) ||
						 (this._world[y][x].edge['bottom'] && this._world[y][x].edge['right']) ||
						 (this._world[y][x].edge['bottom'] && this._world[y][x].edge['left']) ) {
						this._world[y][x].corner = true
					}
				}				
			}
		}
	}

}

class Column {

	private _defined: boolean
	private _x: number
	private _y: number
	private _height: number
	private _blockGroup: number
	private _corner: boolean
	private _edge: object = { 'top': false, 'right': false, 'bottom': false, 'left': false }
	private _tileStack: Tile[] = []

	constructor(private defined: boolean, private colX: number, private colY: number, private colHeight: number) {
		this._defined = defined
		this._x = colX
		this._y = colY
		this._height = colHeight
	}

	set x(x: number) {
		this._x = x
	}

	set y(y: number) {
		this._y = y
	}

	set height(height: number) {
		this._height = height
	}

	set blockGroup(groupNum: number) {
		this._blockGroup = groupNum
	}

	set corner(corner: boolean) {
		this._corner = corner
	}

	set edge(edge: object) {
		this._edge = edge
	}

	set tileStack(tiles: Tile[]) {
		this._tileStack = tiles
	}

	get isDefined(): boolean {
		return this._defined
	}

	get x(): number {
		return this._x
	}

	get y(): number {
		return this._y
	}

	get height(): number {
		return this._height
	}

	get blockGroup(): number {
		return this._blockGroup
	}

	get corner(): boolean {
		return this._corner
	}

	get edge(): object {
		return this._edge
	}

	get tileStack(): Tile[] {
		return this._tileStack
	}

	public getTile(height: number): Tile {
		return this._tileStack[height]
	}
}
