import { MapGenerationFunctions, BuildingHeightVariations, Color } from './mapGenerationFunctions.component'
import { Tile, TileType } from './tile.component'
import { Config, Position } from './config.component'
import { Primitives } from './primitives.component'
import { Modifiers } from './modifiers.component'

export class Map {

	private mapGen: MapGenerationFunctions = new MapGenerationFunctions()
	private config: Config = new Config()
	private primitives: Primitives = new Primitives()
	private mods: Modifiers = new Modifiers()

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
	private _surroundingsGrassColor: Color
	private _surroundingsWaterColor: Color
	private _surroundingsSandColor: Color
	private _surroundingsDefaultColor: Color

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
		this._groundColor = this.config.groundColor
		this._HorizontalRemainingEmptyBlocksMin = 0
		this._HorizontalRemainingEmptyBlocksMax = 0
		this._surroundingsGrassColor = new Color('#7bb376')
		this._surroundingsWaterColor = new Color('#6fb9ca')
		this._surroundingsSandColor = new Color('#e9e3ba')
		this._surroundingsDefaultColor = this._surroundingsGrassColor

		let mapLengthHalf = Math.floor(mapLength / 2) 
		let mapWidthHalf = Math.floor(mapWidth / 2)
		let startBlockXfromCenterDeviation = 7
		let startblockLength = this._averageBuildingSize + Math.floor(Math.random() * 4)
		let startblockWidth = this._averageBuildingSize + Math.floor(Math.random() * 3)
		let startblockXfromCenter = 4 + Math.floor(Math.random() * startBlockXfromCenterDeviation)
		let startblockLengthHalf = Math.floor(startblockLength / 2)
		let startblockWidthHalf = Math.floor(startblockWidth / 2)
		let startingPositionX = Math.floor(this._mapWidth / 2) - Math.floor(startblockXfromCenter / 2)
		let useWaterGarden = false

		this._world = []
		let tileHeight = 0
		let firstBlockHeight

		if (this._defaultColor.rgb().g >= 180 && this._defaultColor.rgb().b >= 150) {
			useWaterGarden = true
			this._surroundingsDefaultColor = this._surroundingsWaterColor
		}

		if (this._blockHeightVariation === BuildingHeightVariations.TallCenter) {
			firstBlockHeight = this._blockHeight * 3
		} else if (this._blockHeightVariation === BuildingHeightVariations.TallSurrounds) {
			firstBlockHeight = 3 + Math.round(Math.random())
			this._blockHeight = firstBlockHeight
		} else {
			firstBlockHeight = this._blockHeight + Math.round(Math.random() * 4)
		}

		if (firstBlockHeight > 6) {
			this._decorationLineH = 4
		} else if (firstBlockHeight > 3) {
			this._decorationLineH = 3
		}

		this._blockHeight = firstBlockHeight

		let hollowBuildingBlock = (Math.round(Math.random()) === 1 ? true : false) 
		let openGroundLevel = (Math.round(Math.random()) === 1 ? true : false) 

		for (let y = 0; y < this.mapLength; y++) {

			this._world[y] = []

			for (let x = 0; x < this.mapWidth; x++) {

				let thisBlockGroup = 0

				let column = new Column(false, x, y, 0)

				let yConditions = (y >= mapLengthHalf && y <= (mapLengthHalf + startblockLengthHalf))
				let xConditions = (x > startingPositionX && x <= (startingPositionX + startblockWidth))

				if (yConditions) {

					if (xConditions) {

						thisBlockGroup = 1
						let tileStack = []

						for (let h = 0; h < firstBlockHeight; h++) {

							let isSlope = true
							let thisPillar = false
							let tileType = TileType.Body
							if (h < 2 && openGroundLevel) {
								if (y % 2 === 0) {
									thisPillar = true
								}
								tileType = TileType.None
							}
							let thisWindowed = 0
							let isRoof = (h === firstBlockHeight-1) ? true : false
							let tileColor = this._defaultColor

							if (h === this._decorationLineH) {								
								tileColor = this._lineColor
							} else {
								tileColor = this._defaultColor
							}

							if (this._decorationLineH > 3 && h+1 === this._decorationLineH && h+1 < firstBlockHeight) {
								tileType = TileType.None
								if (y % 2 === 0) {
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
										'roof':			isRoof,
										'pillar': 		thisPillar,
										'slope':		isSlope,
										'windowed': 	thisWindowed,
										'tower': 		false,
										'stairs':		false
									})
								)

							if (this._blockGroups.indexOf(thisBlockGroup) === -1) {
								this._blockGroups.push(thisBlockGroup)
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

		this.setEdges(false)

		/* Make hollow */
		if (hollowBuildingBlock) {

			for (let y = 0; y < this.mapLength; y++) {
				for (let x = 0; x < this.mapWidth; x++) {

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

		if (!!Math.round(Math.random())) {

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
										this._defaultColor)]

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
		}

		this._HorizontalRemainingEmptyBlocksMin = this.getLeastOpenSpaceOnX()['min']
		this._HorizontalRemainingEmptyBlocksMax = this.getLeastOpenSpaceOnX()['max']

		console.log('Space left on the left: ' + this._HorizontalRemainingEmptyBlocksMin)
		console.log('Space left on the right: ' + this._HorizontalRemainingEmptyBlocksMax)

		if (this._HorizontalRemainingEmptyBlocksMin > 7) {

			let landsLength = this._HorizontalRemainingEmptyBlocksMin * 2
			if (landsLength > 18) landsLength = 18
			let landsEdge = this._mapLength - landsLength

			for (let y = Math.floor(landsEdge / 2); y < this.mapLength - Math.floor(landsEdge / 2); y++) {				
				for (let x = 0; x < this._HorizontalRemainingEmptyBlocksMin - 2; x++) {
					if (!this._world[y][x].isDefined) {
						let edgeOfGarden = false
						let tileType: TileType = TileType.Grass
						let tileColor = this._surroundingsDefaultColor
						let defaultHeight = 0
						if (x === 0 || 
							x === this._HorizontalRemainingEmptyBlocksMin - 3) {
							if (useWaterGarden) {
								tileColor = this._defaultColor
								tileType = TileType.HalfBlock
								defaultHeight = 1
							} else {
								tileColor = this._surroundingsSandColor
								tileType = TileType.Grass
							}
						} else if (
								(y === Math.floor(landsEdge / 2) + 1) ||
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
												tileColor)]
						

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
						let tileColor = this._surroundingsDefaultColor
						if (x === this._mapWidth - 1 || 
							x === this._mapWidth - this._HorizontalRemainingEmptyBlocksMax + 2) {
							tileColor = this._surroundingsSandColor
						} else if (
								y === Math.floor(landsEdge / 2) + 1 ||
								y === this.mapLength - Math.floor(landsEdge / 2) - 1) {
							tileColor = this._surroundingsSandColor
						}
						let grass = new Column(true, x, y, 0)
						grass.tileStack = [new Tile(
											this._blockIdIterator, 
											x, 
											y, 
											0, 
											TileType.Grass,
											tileColor)]
						this._world[y][x] = grass
					}
				}
			}
		}

		console.log(this._world)

		this._world = this.mods.clearMapEdges(this)
		this._world = this.mods.mirrorMap(this)
		this.setEdges(false)

		console.log(this._blockEdges)
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

	get decorativeColors(): object {
		return { lineColor: this._lineColor }
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
				if (this._world[y][x].isDefined) {
					column = this._world[y][x]
					break;
				}
			}
		}
		
		return column
	}

	public addToBuilding(): void {
		this._world = this.mods.addBuildingComponent(this)
		this._world = this.mods.mirrorMap(this)
		this._world = this.mods.clearMapEdges(this)
		this.setEdges(false)		
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

	public getEdges(): Position[] {

		this._blockEdges = []

		for (let y = 0; y < this._mapLength; y++) {
			// only check second half of map

			if (y > this._mapHalfLength + (this._blockAmountIterator - 1) && y < this._mapLength - 2) {

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
}

export class Column {

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

	public removeTopTile(): void {
		this._tileStack.pop()
	}
}
