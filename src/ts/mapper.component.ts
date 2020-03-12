import { MapGenerationFunctions, BuildingHeightVariations, Color } from './mapGenerationFunctions.component'
import { Tile, TileType, TileOptions } from './tile.component'
import { Config, Position, Dimensions } from './config.component'
import { Primitives } from './primitives.component'
import { Modifiers } from './modifiers.component'
import { Decorations } from './decorations.component'

export class Map {

	private mapGen: MapGenerationFunctions = new MapGenerationFunctions()
	private config: Config = new Config()
	private primitives: Primitives = new Primitives()
	private mods: Modifiers = new Modifiers()
	private deco: Decorations = new Decorations()

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
	private _startBlockWidth: number
	private _startBlockLength: number
	private _mapHalfLength: number
	private _world: any[][]
	private _mirrorAtCenter: boolean
	private _blockHeightsArray: number[]
	private _blockGroups: number[]
	private _blockEdges: Position[]	
	private _blockHeightVariationLabels = [BuildingHeightVariations.TallCenter, BuildingHeightVariations.TallSurrounds, BuildingHeightVariations.Random]
	private _blockHeightVariation = this._blockHeightVariationLabels[Math.floor(Math.random() * 3)]
	private _blockIdIterator: number
	private _blockHeightIterator: number
	private _blockAmountIterator: number
	private _HorizontalRemainingEmptyBlocksMin: number
	private _HorizontalRemainingEmptyBlocksMax: number
	private _decorationLineH: number
	private _groundColor: Color
	private _defaultColor: Color
	private _lineColor: Color
	private _firstLevelColor: Color
	private _surroundingsGrassColor: Color
	private _surroundingsWaterColor: Color
	private _surroundingsSandColor: Color
	private _surroundingsDefaultColor: Color
	private _showWindows: number

	constructor(	
			mapWidth: number, 
			mapLength: number, 
			mapMaxHeight: number, 
			mapEdgeWidth: number,
			averageBuildingSize: number,
			blockHeight: number,
			maximumBlockIterations: number,
			mirrorAtCenter: boolean = false)
	{
		this._world = []
		this._mapWidth = mapWidth
		this._mapLength = mapLength
		this._mapMaxHeight = mapMaxHeight
		this._mapEdgeWidth = mapEdgeWidth
		this._averageBuildingSize = averageBuildingSize 
		this._blockHeight = blockHeight
		this._mirrorAtCenter = mirrorAtCenter
		let baseHeight = 2
		let scaleFactor
		if (this._blockHeightVariation === BuildingHeightVariations.TallCenter) {
			scaleFactor = 2
		} else if (this._blockHeightVariation === BuildingHeightVariations.TallSurrounds) {
			scaleFactor = 8
		} else {
			scaleFactor = 4
		}
		if (Math.round(Math.random()) === 0) {
			this._startBlockWidth = this._averageBuildingSize + Math.floor(Math.random() * scaleFactor)
			this._startBlockLength = Math.floor(this._startBlockWidth * this.config.goldenRatio)
		} else {
			this._startBlockLength = this._averageBuildingSize + Math.floor(Math.random() * scaleFactor)
			this._startBlockWidth = Math.floor(this._startBlockLength * this.config.goldenRatio)
		}		
		this._maximumBlockIterations = maximumBlockIterations
		this._additionalBlockIterations = this.mapGen.calculateAdditionalBlockIterations(maximumBlockIterations)
		this._blockGroups = []
		this._blockEdges = []
		this._blockHeightsArray = []
		this._mapHalfLength = Math.floor(mapLength / 2)
		this._blockIdIterator = 0
		this._blockAmountIterator = 1
		this._blockHeightIterator = 1
		this._decorationLineH = -1
		let newLineHue = this.config.buildingBaseColor.getColorStringByHue(-120)
		let lineColor = new Color(newLineHue)
		this._defaultColor = new Color(this.config.buildingBaseColor.hex())
		this._lineColor = lineColor.changeColorLighting(-30)
		this._firstLevelColor = new Color(this.config.buildingBaseColor.getColorStringByHue(10)).changeColorLighting(-20)
		this._groundColor = this.config.groundColor
		this._HorizontalRemainingEmptyBlocksMin = 0
		this._HorizontalRemainingEmptyBlocksMax = 0
		this._surroundingsGrassColor = new Color('#7bb376')
		this._surroundingsWaterColor = new Color('#6fb9ca')
		this._surroundingsSandColor = new Color('#e9e3ba')
		this._surroundingsDefaultColor = this._surroundingsGrassColor
		this._showWindows = this.config.allowWindows ? Math.round(Math.random() * 2) : 0

		let startblockYfromCenterDeviation = 0
		if (!this._mirrorAtCenter) {			
			startblockYfromCenterDeviation = -8
			if (Math.round(Math.random()) === 0) {
				startblockYfromCenterDeviation = 8
			}
			console.log('not mirrorred: dev:', startblockYfromCenterDeviation)
		}

		let mapLengthHalf = Math.floor(mapLength / 2) 
		let mapWidthHalf = Math.floor(mapWidth / 2)
		let startBlockXfromCenterDeviation = 7		
		let startblockXfromCenter = 4 + Math.floor(Math.random() * startBlockXfromCenterDeviation)
		let startblockLengthHalf = Math.floor(this._startBlockLength / 2)
		let startblockWidthHalf = Math.floor(this._startBlockWidth / 2)
		let startingPositionX = Math.floor(this._mapWidth / 2) - Math.floor(startblockXfromCenter / 2)
		let buildGardens = !!(Math.round(Math.random() * 2))
		let useWaterGarden = false
		let tileHeight = 0
		let firstBlockHeightRandom = Math.floor(Math.random() * this.config.fibonacci.length)
		let firstBlockHeight = this.config.fibonacci[firstBlockHeightRandom]
		let slopeY = 0

		if (this._defaultColor.rgb().g >= 180 && this._defaultColor.rgb().b >= 150 && Math.round(Math.random() * 4) >= 3) {
			useWaterGarden = (Math.round(Math.random() * 10) > 6) ? true : false
			this._surroundingsDefaultColor = this._surroundingsWaterColor
		} else if (Math.round(Math.random() * 10) <= 1) {
			useWaterGarden = (Math.round(Math.random() * 10) > 3) ? true : false
			this._surroundingsDefaultColor = this._surroundingsWaterColor
		}

		if (this._blockHeightVariation === BuildingHeightVariations.TallCenter) {
			firstBlockHeight = this.config.fibonacci[maximumBlockIterations]
		} else if (this._blockHeightVariation === BuildingHeightVariations.TallSurrounds) {
			firstBlockHeight = baseHeight + this.config.fibonacci[0]
			this._blockHeight = firstBlockHeight
		}

		let hollowArchWays = false

		if (firstBlockHeight === 3) {
			hollowArchWays = true
		}

		if (firstBlockHeight > 6) {
			this._decorationLineH = 4
		} else if (firstBlockHeight > 3) {
			this._decorationLineH = 3
		}

		if (firstBlockHeight < 4) {
			if (Math.round(Math.random() * 5) > 2) {
				slopeY = startingPositionX + Math.ceil(Math.random() * this._startBlockWidth - 2)
			}
		}

		this._blockHeight = firstBlockHeight

		let hollowBuildingBlock = (Math.round(Math.random()) === 1 ? true : false) 
		let openGroundLevel = (this._blockHeight > 2) ? (Math.round(Math.random()) === 1 ? true : false) : false

		// console.log('y deviation:', startblockYfromCenterDeviation)
		// console.log('y min: ', mapLengthHalf + startblockYfromCenterDeviation)
		// console.log('y max: ', mapLengthHalf + (startblockYfromCenterDeviation + this._startBlockLength))
		// console.log('this._blockHeight', this._blockHeight)

		for (let y = 0; y < this.mapLength; y++) {

			this._world[y] = []

			for (let x = 0; x < this.mapWidth; x++) {

				let thisBlockGroup = 0

				let column = new Column(false, x, y, 0)
				let yConditions
				let xConditions = (x > startingPositionX && x <= (startingPositionX + this._startBlockWidth))

				if (!this._mirrorAtCenter) {
					yConditions = (y >= mapLengthHalf + startblockYfromCenterDeviation && y <= mapLengthHalf + (startblockYfromCenterDeviation + this._startBlockLength))
				} else {
					yConditions = (y >= mapLengthHalf && y <= (mapLengthHalf + startblockLengthHalf))
				}
				

				if (yConditions) {

					if (xConditions) {

						thisBlockGroup = 1
						let tileStack = []

						for (let h = 0; h < this._blockHeight; h++) {			
							
							let thisPillar = false
							let tileType = TileType.Body
							if (h < 2 && openGroundLevel) {
								if (y % 2 === 0) {
									thisPillar = true
								}
								tileType = TileType.None
							}
							if (this._decorationLineH > 3 && h+1 === this._decorationLineH && h+1 < this._blockHeight) {
								tileType = TileType.None
								if (y % 2 === 0) {
									thisPillar = true
								}
							}
							let thisWindowed = 0
							if (!thisPillar && this._showWindows > 0 && h % 2 === 1) {
								thisWindowed = this._showWindows
							}							
							let isRoof = (h === this._blockHeight-1) ? true : false
							let tileColor = this._defaultColor

							if (h === this._decorationLineH) {								
								tileColor = this._lineColor
							} else if (h === 0) { 
								tileColor = this._firstLevelColor
							} else {
								tileColor = this._defaultColor
							}

							let slope = false
							if (h < this._blockHeight && y === slopeY) {
								if (h === 0) {
									if (x === startingPositionX + this._startBlockWidth) {
										slope = true
									}
								} else if (h === 1) {
									if (x === startingPositionX + this._startBlockWidth - 1) {
										slope = true
									} else if (x === startingPositionX + this._startBlockWidth) {
										tileType = TileType.None
									}
								} else if (h === 2) {
									if (x === startingPositionX + this._startBlockWidth - 2) {
										slope = true
									} else if (x > startingPositionX + this._startBlockWidth - 2) {
										tileType = TileType.None
									}
								}
							}

							if (hollowArchWays && h < 2) {
								tileType = TileType.None
								if ((y % 2 === 0 && x % 2 === 1) || (y % 2 === 1 && x % 2 === 0)) {
									thisPillar = true
								}
							}				

							tileStack.push(
								new Tile(
									this._blockIdIterator, 
									x, 
									y, 
									h, 
									tileType,
									tileColor,
									{
										roof:		isRoof,
										pillar: 	thisPillar,
										slope:		slope,
										windowed: 	thisWindowed,
										tower: 		false,
										stairs:		false,
										halfArch: 	false,
										wholeArch:	false,
										areaDecoration: ''
									})
								)

							if (this._blockGroups.indexOf(thisBlockGroup) === -1) {
								this._blockGroups.push(thisBlockGroup)
							}

							this._blockHeightsArray.push(this._blockHeight)

							this._blockIdIterator++
						}

						column = new Column(true, x, y, this._blockHeight)

						column.blockGroup = thisBlockGroup
						column.height = this._blockHeight
						column.corner = false
						column.tileStack = tileStack
					}
				}

				this._world[y][x] = column
			}
		}

		this.setEdges(false)

		/* Make hollow */
		if (hollowBuildingBlock && this._blockHeight > 2) {

			for (let y = 0; y < this.mapLength; y++) {
				for (let x = 0; x < this.mapWidth; x++) {

					if (!!this._world[y][x].edge.left) {
						// console.log('left? ', this._world[y][x].edge.left)
						for (let h = 0; h < this._blockHeight; h++) {
							if (this._world[y][x].tileStack[h].type === TileType.None) {
								if (y % 2 === 0) {
									this._world[y][x].tileStack[h].options.pillar = true
								}
							}
						}
					} 
					if (!!this._world[y][x].edge.bottom) {
						// console.log('bottom? ', this._world[y][x].edge.bottom)
						for (let h = 0; h < this._blockHeight; h++) {
							if (this._world[y][x].tileStack[h].type === TileType.None) {
								if (x % 2 === 0) {
									this._world[y][x].tileStack[h].options.pillar = true
								}
							}
						}
					}
					if (!!this._world[y][x].edge.right) {
						// console.log('right? ', this._world[y][x].edge.right)
						for (let h = 0; h < this._blockHeight; h++) {
							if (this._world[y][x].tileStack[h].type === TileType.None) {
								if (y % 2 === 0) {
									this._world[y][x].tileStack[h].options.pillar = true
								}
							}
						}
					}
					if (!!this._world[y][x].edge.top) {
						// console.log('top? ', this._world[y][x].edge.top)
						for (let h = 0; h < this._blockHeight; h++) {
							if (this._world[y][x].tileStack[h].type === TileType.None) {
								if (x % 2 === 0) {
									this._world[y][x].tileStack[h].options.pillar = true
								}
							}
						}
					}

					let hasEdge = (this._world[y][x].edge.left || this._world[y][x].edge.bottom || this._world[y][x].edge.right) ? true : false

					if (this._world[y][x].isDefined && !hasEdge) {
						this._world[y][x] = new Column(false, x, y, 0)
					}
				}
			}
		}

		
		for (let i = 0; i < this._additionalBlockIterations; i++) {
			this.getEdges()
			this._world = this.mods.addBuildingComponent(this)
		}

		console.log('remove excess arches');
		this._world = this.mods.removeExcessArches(this);

		/*	
		 *	Add gardens or other ornamental features around the building */		

		if (this.config.allowSurroundingDecorations && buildGardens) {

			this._HorizontalRemainingEmptyBlocksMin = this.getLeastOpenSpaceOnX()['min']
			this._HorizontalRemainingEmptyBlocksMax = this.getLeastOpenSpaceOnX()['max']

			if (this._HorizontalRemainingEmptyBlocksMin > 7) {

				let landsLength = this._HorizontalRemainingEmptyBlocksMin * 2
				if (landsLength > 16) landsLength = 16
				let landsEdge = this._mapLength - landsLength

				for (let y = Math.floor(landsEdge / 2); y < this.mapLength - Math.floor(landsEdge / 2); y++) {				
					for (let x = 0; x < this._HorizontalRemainingEmptyBlocksMin - 3; x++) {
						if (!this._world[y][x].isDefined) {
							let edgeOfGarden = false
							let tileType: TileType = TileType.Grass
							let tileColor = this._surroundingsDefaultColor
							let defaultHeight = 0
							if (x === 0 || 
								x === this._HorizontalRemainingEmptyBlocksMin - 4) {
								if (useWaterGarden) {
									tileColor = this._defaultColor
									tileType = TileType.HalfBlock
									defaultHeight = 1
								} else {
									tileColor = this._surroundingsSandColor
									tileType = TileType.Grass
								}
							} else if (
									(y === Math.floor(landsEdge / 2)) ||
									(y === this.mapLength - Math.floor(landsEdge / 2) - 1) ) {
								if (useWaterGarden) {
									tileColor = this._defaultColor
									tileType = TileType.HalfBlock
									defaultHeight = 1
								} else {
									tileColor = this._surroundingsSandColor
									tileType = TileType.Grass
								}
							}

							let gardenBlock = new Column(true, x, y, defaultHeight)
								gardenBlock.tileStack = [new Tile(
													this._blockIdIterator, 
													x, 
													y, 
													0, 
													tileType,
													tileColor,
													{
														roof:		false,
														pillar: 	false,
														slope:		false,
														windowed: 	0,
														tower: 		false,
														stairs:		false,
														halfArch: 	false,
														wholeArch:	false,
														areaDecoration: ''
													})]
							

							this._world[y][x] = gardenBlock
							this._blockIdIterator++
						}
					}
				}
			}

			if (this._HorizontalRemainingEmptyBlocksMax > 7) {

				let landsLength = this._HorizontalRemainingEmptyBlocksMax * 2
				let landsEdge = this._mapLength - landsLength

				for (let y = Math.floor(landsEdge / 2); y < this.mapLength - Math.floor(landsEdge / 2); y++) {
					for (let x = this._mapWidth - this._HorizontalRemainingEmptyBlocksMax + 2; x < this._mapWidth; x++) {
						if (!this._world[y][x].isDefined) {
							let edgeOfGarden = false
							let tileType: TileType = TileType.Grass
							let tileColor = this._surroundingsDefaultColor
							let defaultHeight = 0
							if (x === this._mapWidth - 1 || 
								x === this._mapWidth - this._HorizontalRemainingEmptyBlocksMax + 2) {
								if (useWaterGarden) {
									tileColor = this._defaultColor
									tileType = TileType.HalfBlock
									defaultHeight = 1
								} else {
									tileColor = this._surroundingsSandColor
									tileType = TileType.Grass
								}
							} else if (
									y === Math.floor(landsEdge / 2) ||
									y === this.mapLength - Math.floor(landsEdge / 2) - 1) {
								if (useWaterGarden) {
									tileColor = this._defaultColor
									tileType = TileType.HalfBlock
									defaultHeight = 1
								} else {
									tileColor = this._surroundingsSandColor
									tileType = TileType.Grass
								}
							}

							let gardenBlock = new Column(true, x, y, defaultHeight)
								gardenBlock.tileStack = [new Tile(
													this._blockIdIterator, 
													x, 
													y, 
													0, 
													tileType,
													tileColor,
													{
														roof:		false,
														pillar: 	false,
														slope:		false,
														windowed: 	0,
														tower: 		false,
														stairs:		false,
														halfArch: 	false,
														wholeArch:	false,
														areaDecoration: ''
													})]
							

							this._world[y][x] = gardenBlock
							this._blockIdIterator++
						}
					}
				}
			}
		}

		for (let e = 0; e < this._blockEdges.length; e++) {
			let edgePointY = this._blockEdges[e].y
			let edgePointX = this._blockEdges[e].x
			let grass = new Column(true, edgePointX, edgePointY, 0)
				grass.tileStack = [new Tile(
									this._blockIdIterator, 
									edgePointX, 
									edgePointY, 
									0, 
									TileType.Shadow,
									this._defaultColor,
									{
										roof:		false,
										pillar: 	false,
										slope:		false,
										windowed: 	0,
										tower: 		false,
										stairs:		false,
										halfArch: 	false,
										wholeArch:	false,
										areaDecoration: ''
									})]

			if (this._world[edgePointY][edgePointX].isDefined) {
				
				if (!this._world[edgePointY - 1][edgePointX].isDefined) {
					this._world[edgePointY - 1][edgePointX] = grass
				}
				if (!this._world[edgePointY + 1][edgePointX].isDefined) {
					this._world[edgePointY + 1][edgePointX] = grass
				}
				if (!this._world[edgePointY][edgePointX - 1].isDefined) {
					this._world[edgePointY][edgePointX - 1] = grass
				}
				if (!this._world[edgePointY][edgePointX + 1].isDefined) {
					this._world[edgePointY][edgePointX + 1] = grass
				}
			}

			this._blockIdIterator++
		}

		/*
		 *	Reset grass tiles beneath pillars and empty tiles below building blocks that
		 *	should be grass tiles
		 */

		this._world = this.mods.resetGrassTilesBelowPillars(this);


		/* 	
		 *	Clear the edges and mirror the building
		 */

		this._world = this.mods.clearMapEdges(this)
		if (this._mirrorAtCenter) {
			this._world = this.mods.mirrorMap(this)
		}		
		// this.setEdges(true)

		this._world = this.deco.placeRandomTrees(this)

		console.log(this._world)
	}	

	get mapWidth(): number {
		return this._mapWidth
	}

	get mapLength(): number {
		return this._mapLength
	}

	get mapHalfLength(): number {
		return this._mapHalfLength
	}

	get mapEdgeWidth(): number {
		return this._mapEdgeWidth
	}

	get map(): any[] {
		return this._world
	}

	get blockGroups(): number[] {
		return this._blockGroups
	}

	set blockGroups(blockGroups: number[]) {
		this._blockGroups = blockGroups
	}

	get blockHeight(): number {
		return this._blockHeight
	}

	get mapMaxHeight(): number {
		return this._mapMaxHeight
	}

	get startBlockSize(): Dimensions {
		return { w: this._startBlockWidth, l: this._startBlockLength }
	}

	set blockHeight(height: number) {
		this._blockHeight = height
	}

	get maxBlockIterations(): number {
		return this._maximumBlockIterations
	}

	get blockAmountIterator(): number {
		return this._blockAmountIterator
	}

	set blockAmountIterator(i: number) {
		this._blockAmountIterator = i
	}

	get averageBuildingSize(): number {
		return this._averageBuildingSize
	}

	get blockEdges(): object[] {
		return this._blockEdges
	}

	set blockEdges(blockEdges: object[]) {
		this._blockEdges = blockEdges
	}

	get blockHeightsArray(): number[] {
		return this._blockHeightsArray
	}

	set blockHeightsArray(heightsArray: number[]) {
		this._blockHeightsArray = heightsArray
	}

	get blockIdIterator(): number {
		return this._blockIdIterator
	}

	set blockIdIterator(i: number) {
		this._blockIdIterator = i
	}

	get blockHeightVariation(): BuildingHeightVariations {
		return this._blockHeightVariation
	}

	get lineHeight(): number {
		return this._decorationLineH
	}

	get groundColor(): Color {
		return this._groundColor
	}

	get defaultColor(): Color {
		return this._defaultColor
	}

	get firstLevelColor(): Color {
		return this._firstLevelColor
	}

	get decorativeColors(): object {
		return { lineColor: this._lineColor }
	}

	get showWindows(): number {
		return this._showWindows
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

	public getFirstDefinedColumn(): Column {
		let column

		for (let y = 0; y < this.mapLength; y++) {
			for (let x = 0; x < this.mapWidth; x++) {
				if (this._world[y][x].isDefined && this._world[y][x].height > 0) {
					column = this._world[y][x]
					break;
				}
			}
		}
		
		return column
	}	

	setEdges(considerLowerEdges: boolean): void {

		for (let y = 0; y < this.mapLength; y++) {
			for (let x = 0; x < this.mapWidth; x++) {
				
				if (y > 0 && x > 0 && y < this.mapLength - 1 && x < this.mapWidth - 1 && this._world[y][x].isDefined) {

					if (considerLowerEdges) {

						if (this._world[y-1][x].height < this._world[y][x].height || y === 0) {
							this._world[y][x].edge.top = true
						}

						if (this._world[y+1][x].height < this._world[y][x].height || y === this.mapLength - 1) {
							this._world[y][x].edge.bottom = true
						}

						if (this._world[y][x-1].height < this._world[y][x].height) {
							this._world[y][x].edge.left = true
						}

						if (this._world[y][x+1].height < this._world[y][x].height) {
							this._world[y][x].edge.right = true
						}

					} else {

						if (!this._world[y-1][x].isDefined || y === 0) {
							this._world[y][x].edge.top = true
						}

						if (!this._world[y+1][x].isDefined || y === this.mapLength - 1) {
							this._world[y][x].edge.bottom = true
						}

						if (!this._world[y][x-1].isDefined) {
							this._world[y][x].edge.left = true
						}

						if (!this._world[y][x+1].isDefined) {
							this._world[y][x].edge.right = true
						}
					}

					if ( (this._world[y][x].edge.top && this._world[y][x].edge.right) ||
						 (this._world[y][x].edge.top && this._world[y][x].edge.left) ||
						 (this._world[y][x].edge.bottom && this._world[y][x].edge.right) ||
						 (this._world[y][x].edge.bottom && this._world[y][x].edge.left) ) {
						this._world[y][x].corner = true
					}
				}				
			}
		}
	}

	public getEdges(): Position[] {

		this._blockEdges = []
		let yConditions		

		for (let y = 0; y < this._mapLength; y++) {
			// only check second half of map

			if (!this._mirrorAtCenter) {	
				yConditions = y > 2 && y < this._mapLength - 2
			} else {
				yConditions = y > this._mapHalfLength + (this._blockAmountIterator - 1) && y < this._mapLength - 2
			}

			if (yConditions) {

				for (let x = 0; x < this._mapWidth; x++) {
					
					if (x > this._mapEdgeWidth && x < this._mapWidth - 1) {

						if (this._world[y][x].isDefined) {

							if (!this._world[y][x+1].isDefined || 
								!this._world[y][x-1].isDefined || 
								!this._world[y+1][x].isDefined || 
								!this._world[y-1][x+1].isDefined || 
								!this._world[y-1][x-1].isDefined) {

								if (y > this._mapLength - 1) {
									y = this._mapLength - 1
								}

								let pos: Position = {x: x, y: y}

								this._blockEdges.push(pos)

							} else if ((!this._world[y-1][x].isDefined && !this._world[y+1][x].isDefined) ||
								(!this._world[y][x-1].isDefined && !this._world[y][x+1].isDefined)) {

								if (y > this._mapLength - 1) {
									y = this._mapLength - 1
								}

								let pos: Position = {x: x, y: y}

								this._blockEdges.push(pos)	
							}
						}
					}
				}
			}
		}

		return this._blockEdges
	}

	getLeastOpenSpaceOnX(): object {
		let xMinValues = []
		let xMaxValues = []

		for (let y = 0; y < this.mapLength; y++) {
			
			let xMin = 0
			let xMax = 0
			
			for (let x = 0; x < this.mapWidth; x++) {
				if (x < Math.floor(this.mapWidth / 2)) {
					if (!this._world[y][x].isDefined && this._world[y][x].height === 0) {
						xMin++
					}
				} else {
					if (!this._world[y][x].isDefined && this._world[y][x].height === 0) {
						xMax++
					}
				}			
			}
			
			xMinValues.push(xMin)
			xMaxValues.push(xMax)
		}

		return {'min': Math.min(...xMinValues), 'max': Math.min(...xMaxValues) }		
	}

	public addToBuilding(): void {
		this._world = this.mods.addBuildingComponent(this)
		// this._world = this.mods.mirrorMap(this)
		this._world = this.mods.clearMapEdges(this)
		this.setEdges(false)
		console.log(this._world)	
	}
}

export class Column {

	private _defined: boolean
	private _x: number
	private _y: number
	private _height: number
	private _blockGroup: number
	private _corner: boolean
	private _edge: ColumnEdge = { top: false, right: false, bottom: false, left: false }
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

	set height(h: number) {
		this._height = h
	}

	set blockGroup(groupNum: number) {
		this._blockGroup = groupNum
	}

	set corner(corner: boolean) {
		this._corner = corner
	}

	set edge(edge: ColumnEdge) {
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

	get edge(): ColumnEdge {
		return this._edge
	}

	get tileStack(): Tile[] {
		return this._tileStack
	}

	public getTile(height: number): Tile {
		return this._tileStack[height]
	}

	public removeTopTile(): void {
		this._tileStack.pop()
	}
}

export interface ColumnEdge {
	top: boolean,
	right: boolean,
	bottom: boolean,
	left: boolean
}