import { MapGenerationFunctions, TileColor } from './mapGenerationFunctions.component'
import { Tile, TileType } from './tile.component'

export default class MapGenerator {

	private mapWidth: number
	private mapLength: number
	private mapMaxHeight: number
	private averageBuildingSize: number
	private blockHeight: number
	private maximumBlockIterations: number
	private additionalBlockIterations: number
	private mapEdgeWidth: number
	private highestPoint: number
	private startBlockXfromCenterDeviation: number
	private world: any[][]
	private blockHeightsArray: number[]
	private blockGroupCollection: any[]
	private blockGroups: any[]
	private startBlockEdges: number[]
	private additionalBlockEdges: number[]
	private mapGenerationFunctions: MapGenerationFunctions = new MapGenerationFunctions()
	private blockHeightVariationLabels = ['tallcenter', 'tallsurrounds', 'random'];
	private blockHeightVariation = this.blockHeightVariationLabels[Math.floor(Math.random() * 3)];

	public createMap(	
			mapWidth: number, 
			mapLength: number, 
			mapMaxHeight: number, 
			mapEdgeWidth: number,
			averageBuildingSize: number,
			blockHeight: number,
			maximumBlockIterations: number) : any[]
	{
		this.mapWidth = mapWidth
		this.mapLength = mapLength
		this.mapMaxHeight = mapMaxHeight
		this.mapEdgeWidth = mapEdgeWidth
		this.averageBuildingSize = averageBuildingSize
		this.blockHeight = blockHeight
		this.maximumBlockIterations = maximumBlockIterations
		this.additionalBlockIterations = this.mapGenerationFunctions.calculateAdditionalBlockIterations(maximumBlockIterations)
		this.blockGroups = []

		let mapLengthHalf = Math.floor(mapLength / 2)
		let mapWidthHalf = Math.floor(mapWidth / 2)
		let startBlockXfromCenterDeviation = 6
		let startblockLength = (this.averageBuildingSize + 1) + Math.floor(Math.random() * 6)
		let startblockWidth = this.averageBuildingSize + Math.floor(Math.random() * 5)
		let startblockXfromCenter = 2 + Math.floor(Math.random() * startBlockXfromCenterDeviation)
		let startblockLengthHalf = Math.floor(startblockLength / 2)
		let startblockWidthHalf = Math.floor(startblockWidth / 2)
		let startingPositionX = Math.floor(mapWidth / 2) - Math.floor(startblockXfromCenter / 2)

		this.world = []
		let i = 0
		let tileHeight = 0
		let firstBlockHeight

		if (this.blockHeightVariation == 'tallcenter') {
			firstBlockHeight = blockHeight * 2;
		} else if (this.blockHeightVariation == 'tallsurrounds') {
			firstBlockHeight = 1 + Math.round(Math.random());
			blockHeight = firstBlockHeight;
		} else {
			firstBlockHeight = blockHeight;
		}

		for (let y = 0; y < this.mapLength; y++) {
			this.world[y] = []
			for (let x = 0; x < this.mapWidth; x++) {

				let thisBlockGroup = 0

				let column = new Column(x, y, 0)

				if (y >= mapLengthHalf && y <= (mapLengthHalf + startblockLengthHalf) ) {

					if (x > startingPositionX && x <= (startingPositionX + startblockWidth) ) {

						thisBlockGroup = 1
						let tileStack = []

						for (let h = 0; h < firstBlockHeight; h++) {

							let thisPillar = 0
							let thisWindowed = 0

							tileStack.push(
								new Tile(
									i, 
									x, 
									y, 
									h, 
									TileType.Body, 
									thisBlockGroup, 
									TileColor.Red, 
									TileColor.Green, 
									TileColor.Blue,
									{
										'pillar': 		thisPillar,
										'windowed': 	thisWindowed,
										'tower': 		false,
										'marker': 		0
									})			
								)

							if (this.blockGroups.indexOf(thisBlockGroup) == -1) {
								this.blockGroups[thisBlockGroup] = new Array( [y,x] );
							} else {
								this.blockGroups[thisBlockGroup].push([y,x]);
							}							
						}

						column = new Column(x, y, firstBlockHeight)

						column.blockGroup = thisBlockGroup
						column.height = firstBlockHeight
						column.corner = false
						column.edge = false
						column.tileStack = tileStack
					}
				}

				this.world[y][x] = column;

				i++;
			}
		}

		return this.world
	}

	public getColumn(x, y): Column {
		return this.world[y][x]
	}

}

class Column {

	_x: number
	_y: number
	_height: number
	_blockGroup: number
	_corner: boolean
	_edge: boolean
	_tileStack: Tile[] = []

	constructor(private colX: number, private colY: number, private colHeight: number) {
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

	set edge(edge: boolean) {
		this._edge = edge
	}

	set tileStack(tiles: Tile[]) {
		this._tileStack = tiles
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

	get edge(): boolean {
		return this._edge
	}

	get tileStack(): Tile[] {
		return this._tileStack
	}
}

class BlockGroup {

	blockgroups: object[]

}