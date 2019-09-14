import { MapGenerationFunctions, BuildingHeightVariations } from './mapGenerationFunctions.component'
import { Tile, TileType } from './tile.component'
import { Config, Position } from './config.component'
import { Primitives } from './primitives.component'

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
	private _mapHalfLength: number
	private _world: any[][]
	private _blockHeightsArray: number[]
	private _blockGroupCollection: any[]
	private _blockGroups: any[]
	private _blockEdges: Position[]
	private _additionalBlockEdges: Position[]
	private _mapGen: MapGenerationFunctions = new MapGenerationFunctions()
	private config: Config = new Config()
	private primitives: Primitives = new Primitives()
	private _blockHeightVariationLabels = [BuildingHeightVariations.TallCenter, BuildingHeightVariations.TallSurrounds, BuildingHeightVariations.Random]
	private _blockHeightVariation = this._blockHeightVariationLabels[Math.floor(Math.random() * 3)]
	private _blockIdIterator: number

	constructor(	
			mapWidth: number, 
			mapLength: number, 
			mapMaxHeight: number, 
			mapEdgeWidth: number,
			averageBuildingSize: number,
			blockHeight: number,
			maximumBlockIterations: number,
			pyramid: boolean)
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
		this._blockEdges = []
		this._blockHeightsArray = []
		this._mapHalfLength = Math.floor(mapLength / 2)
		this._blockIdIterator = 0

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
		let tileHeight = 0
		let firstBlockHeight

		if (this._blockHeightVariation === BuildingHeightVariations.TallCenter) {
			firstBlockHeight = blockHeight * 2
		} else if (this._blockHeightVariation === BuildingHeightVariations.TallSurrounds) {
			firstBlockHeight = 1 + Math.round(Math.random())
			blockHeight = firstBlockHeight
		} else {
			firstBlockHeight = blockHeight
		}

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
									this._blockIdIterator, 
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

							this._blockHeightsArray.push(firstBlockHeight)

							this._blockIdIterator++
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

		for (let i = 0; i < this._additionalBlockIterations; i++) {

			console.log('iteration #'+i)
			this.getEdges()

			let randomPositionPicker = 3 + Math.ceil(Math.random() * (this._blockEdges.length / 2))
			let thisHeight = 0

			console.log('this._blockEdges', this._blockEdges)
			console.log('randomPositionPicker', randomPositionPicker)

			if (this._blockHeightVariation === BuildingHeightVariations.TallCenter) {
				thisHeight = this._blockHeight - i;
				
			} else if (this._blockHeightVariation === BuildingHeightVariations.TallSurrounds) {

				thisHeight = this._blockHeight + i;

			} else if (this._blockHeightVariation === BuildingHeightVariations.Random) {

				thisHeight = this._blockHeight + 1;
			}

			if (thisHeight < 2) {
				thisHeight = 2
			} else if (thisHeight > this.config.maxAllowedHeight) {
				thisHeight = this.config.maxAllowedHeight
			}

			let yPos = this._blockEdges[randomPositionPicker].x
			let xPos = this._blockEdges[randomPositionPicker].y

			let thisBlockLength = (this._averageBuildingSize - 2) + Math.floor(Math.random() * 4)
			let thisBlockWidth = (this._averageBuildingSize - 2) + Math.floor(Math.random() * 4)

			for (let y = 0; y < this._mapLength; y++) {
				
				for (let x = 0; x < this._mapWidth; x++) {

					if (y >= (yPos - Math.floor(thisBlockLength / 2)) && 
						y <= (yPos + Math.floor(thisBlockLength / 2)) && 
						x >= (xPos - Math.floor(thisBlockWidth / 2)) && 
						x <= (xPos + Math.floor(thisBlockWidth / 2)) ) {

						let thisBlockGroup = i+2
						let tileStack = []

						for (let h = 0; h < thisHeight; h++) {

							let thisPillar = 0
							let thisWindowed = 0
							let isRoof = (h === thisHeight-1) ? true : false

							tileStack.push(
								new Tile(
									this._blockIdIterator, 
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

							this._world[y][x] = null

							let column = new Column(true, x, y, thisHeight)

							column.blockGroup = thisBlockGroup
							column.height = thisHeight
							column.corner = false
							column.tileStack = tileStack

							this._blockHeightsArray.push(thisHeight)

							this._blockIdIterator++

							this._world[y][x] = column
						}
					}					
				}
			}
		}

		this.clearMapEdges()
		this.mirrorMap()
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

	setEdges(considerLowerEdges: boolean): void {

		for (let y = 0; y < this.mapLength; y++) {
			for (let x = 0; x < this.mapWidth; x++) {
				
				if (y > 0 && x > 0 && y < this.mapLength-1 && x < this.mapWidth-1 && this._world[y][x].isDefined) {

					if (considerLowerEdges) {

						if (this._world[y-1][x].height < this._world[y][x].height) {
							this._world[y][x].edge.top = true
						}

						if (this._world[y+1][x].height < this._world[y][x].height) {
							this._world[y][x].edge.bottom = true
						}

						if (this._world[y][x-1].height < this._world[y][x].height) {
							this._world[y][x].edge.left = true
						}

						if (this._world[y][x+1].height < this._world[y][x].height) {
							this._world[y][x].edge.right = true
						}

					} else {

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

	getEdges(): void {

		for (let y = 0; y < this._mapLength; y++) {
			// only check second half of map

			if (y > this._mapHalfLength + 1) {

				for (let x = 0; x < this._mapWidth; x++) {
					
					if (x > this._mapEdgeWidth && x < this._mapWidth - 1) {

						if (this._world[y][x].isDefined) {

							// if the current tile type is 0, look to the tiles around it to find the edges
							if (this._world[y][x+1].isDefined || 
								this._world[y][x-1].isDefined || 
								this._world[y-1][x].isDefined || 
								this._world[y-1][x+1].isDefined || 
								this._world[y-1][x-1].isDefined) {

								// push edges above the block

								let pos: Position = {x: x,y: y}

								this._blockEdges.push(pos)								
							}
						}
					}
				}
			}
		}
	}

	clearMapEdges(): void {

		for (let y = 0; y < this._mapLength; y++) {
			for (let x = 0; x < this._mapWidth; x++) {
				if (x <= this._mapEdgeWidth || x >= this._mapWidth - this._mapEdgeWidth ||
					y <= this._mapEdgeWidth || y >= this._mapLength - this._mapEdgeWidth) {
					this._world[y][x] = null
					let column = new Column(false, x, y, 0)
					this._world[y][x] = column
				}
			}
		}
	}

	createPyramid(): void {

		let pyramid = this.primitives.getPyramid()
		let remainderLength = this.mapLength - pyramid.length
		let remainderWidth = this.mapWidth - pyramid[0].length
		let edgeX = Math.round(remainderWidth / 2)
		let edgeY = Math.round(remainderLength / 2)
		let row: number[] = []
		let edge: number[] = []

		for (let i = 0; i < this.mapWidth; i++) {
			row.push(0)
		}

		for (let y = 0; y < pyramid.length; y++) {
			for (let r = 0; r < edgeX; r++) {
				pyramid[y].unshift(0)
				pyramid[y].push(0)
			}
		}

		for (let y = 0; y < this.mapLength-1; y++) {
			if (y < edgeY - 1) {
				pyramid.unshift(row)
			} else if (y > pyramid.length + 2 - edgeY) {
				pyramid.push(row)
			}
		}

		this._world = pyramid
		let i = 0

		for (let y = 0; y < this.mapLength; y++) {

			for (let x = 0; x < this.mapWidth; x++) {

				let height = pyramid[y][x]				

				let column = new Column(false, x, y, 0)

				let thisBlockGroup = 0
				let tileStack = []

				if (height > 0) {

					for (let h = 0; h < height; h++) {

						let thisPillar = 0
						let thisWindowed = 0
						let isRoof = (h === height-1) ? true : false

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

					column = new Column(true, x, y, height)

					column.blockGroup = thisBlockGroup
					column.height = height
					column.corner = false
					column.tileStack = tileStack
				}				

				this._world[y][x] = column
			}
		}
	}

	mirrorMap(): void {

		let mapLengthEven = false

		// determine if map length is even or uneven
		if ((this._mapHalfLength % 2) == 0) {
			mapLengthEven = true;
		}

		let i = 0;

		console.log('this._blockGroups', this._blockGroups)

		for (let y = 0; y < this._mapHalfLength; y++) {
			if (y < this._mapHalfLength) {
							
				for (let x = 0; x < this._mapWidth; x++) {

					if (this._world[this._mapHalfLength-y-1][x].isDefined) {

						let newGroupId = this._blockGroups.length + 1

						let thisHeight = this._world[this._mapHalfLength-y-1][x].height
						let tileStack = []

						for (let h = 0; h < thisHeight; h++) {

							let tileType = this._world[this._mapHalfLength-y-1][x].tileStack[h].type
							let tileOptions = this._world[this._mapHalfLength-y-1][x].tileStack[h].options

							tileStack.push(
								new Tile(
									this._blockIdIterator, 
									x, 
									y, 
									h, 
									tileType,
									this.config.buildingBaseColor,
									tileOptions)
								)
						}

						this._world[y][x] = null

						let column = new Column(true, x, y, thisHeight)

						column.blockGroup = newGroupId
						column.height = thisHeight
						column.corner = this._world[this._mapHalfLength-y-1][x].corner
						column.edge = this._world[this._mapHalfLength-y-1][x].edge
						column.tileStack = tileStack

						this._world[y][x] = column

						if (this._blockGroups.indexOf(newGroupId) === -1) {
							this._blockGroups[newGroupId] = new Array( [y,x] )
						} else {
							this._blockGroups[newGroupId].push([y,x])
						}

						this._blockIdIterator++
					
					} else {
						this._world[y][x] = null
						this._world[y][x] = new Column(false, x, y, 0)
					}
				}

			}
		}

		/*
		for (var y=0; y<mapLength; y++) {
			if (y < mapLengthHalf) {
							
				for (var x=0; x<mapWidth; x++) {
					
					if (world[mapLength-y-1][x].blockGroup > 0) {
						if (world[mapLength-y-1][x].blockGroup == 0) var thisGroup = 0;
						if (world[mapLength-y-1][x].blockGroup == 1) var thisGroup = 1;
						if (world[mapLength-y-1][x].blockGroup == 2) var thisGroup = 8;
						if (world[mapLength-y-1][x].blockGroup == 3) var thisGroup = 9;
						if (world[mapLength-y-1][x].blockGroup == 4) var thisGroup = 10;
						if (world[mapLength-y-1][x].blockGroup == 5) var thisGroup = 11;
						if (world[mapLength-y-1][x].blockGroup == 6) var thisGroup = 12;
						if (world[mapLength-y-1][x].blockGroup == 7) var thisGroup = 13;
					}

					var clone = {
						'id': i,
						'tileType': world[mapLength-y-1][x].tileType, 
						'blockGroup': thisGroup,
						'color': world[mapLength-y-1][x].color,
						'groupSurface': world[mapLength-y-1][x].groupSurface,
						'noiseVal': world[mapLength-y-1][x].noiseVal, 
						'height': world[mapLength-y-1][x].height, 
						'floated': world[mapLength-y-1][x].floated, 
						'pillar': world[mapLength-y-1][x].pillar,
						'marker': world[mapLength-y-1][x].marker,
						'edge': world[mapLength-y-1][x].edge,
						'windowed': world[mapLength-y-1][x].windowed
					};

					world[y][x] = clone;

					if (blockGroupCollection.indexOf(thisGroup) == -1 && (thisGroup) != undefined) {
						blockGroupCollection.push(thisGroup);
					}

					if (blockGroups.indexOf( thisGroup ) == -1) {
						blockGroups[ thisGroup ] = new Array( [y,x] );
					} else {
						blockGroups[ thisGroup ].push( [y,x] );
					}

					i++;
				}		
			}
		} */
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
