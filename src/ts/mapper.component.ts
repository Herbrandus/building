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
	private mapGenerationFunctions: MapGenerationFunctions

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
		
		let mapLengthHalf = Math.floor(mapLength / 2)
		let mapWidthHalf = Math.floor(mapWidth / 2)
		let startBlockXfromCenterDeviation = 6
		let startblockLength = (this.averageBuildingSize + 1) + Math.floor(Math.random() * 6)
		let startblockWidth = this.averageBuildingSize + Math.floor(Math.random() * 5)
		let startblockXfromCenter = 2 + Math.floor(Math.random() * startBlockXfromCenterDeviation)
		let startblockLengthHalf = Math.floor(startblockLength / 2)
		let startblockWidthHalf = Math.floor(startblockWidth / 2)

		this.world = []
		let i = 0
		let tileHeight = 0

		for (let y = 0; y < this.mapLength; y++) {
			this.world[y] = []
			for (let x = 0; x < this.mapWidth; x++) {
				this.world[y][x] = new Tile(
					i, 
					x, 
					y, 
					tileHeight, 
					TileType.None, 
					0, 
					TileColor.Red, 
					TileColor.Green, 
					TileColor.Blue)
				i++;
			}
		}

		return this.world
	}

}

class BlockGroup {

	blockgroups: object[]

}