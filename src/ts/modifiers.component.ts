import { Map, Column } from './mapper.component'
import { MapGenerationFunctions, BuildingHeightVariations, Color } from './mapGenerationFunctions.component'
import { Tile, TileType } from './tile.component'
import { Config, Position } from './config.component'

export class Modifiers {

	private config: Config = new Config()

	mirrorMap(world: Map): any[][] {

		let oldBlockGroups = []
		world.blockGroups.forEach(id => {
			oldBlockGroups.push(id)
		})

		for (let y = 0; y < world.mapHalfLength; y++) {
			if (y < world.mapHalfLength) {
							
				for (let x = 0; x < world.mapWidth; x++) {

					if (world.map[world.mapLength - y - 1][x].isDefined) {

						let activeCol = world.map[world.mapLength - y - 1][x]
						let height = activeCol.height

						if (height > 0) {
							let blockGroup = oldBlockGroups.length + activeCol.blockGroup
						
							let tileStack = []

							for (let h = 0; h < height; h++) {

								let tileColor = activeCol.tileStack[h].tileColor
								let thisPillar = activeCol.tileStack[h].options["pillar"]
								let thisWindowed = activeCol.tileStack[h].options["windowed"]
								let isTower = activeCol.tileStack[h].options["tower"]
								let stairs = activeCol.tileStack[h].options["stairs"]

								let isRoof = (h === height-1) ? true : false

								tileStack.push(
									new Tile(
										world.blockIdIterator, 
										x, 
										y, 
										h, 
										activeCol.tileStack[h].type,
										tileColor,
										{
											'roof':			isRoof ? true : false,
											'pillar': 		thisPillar ? true : false,
											'windowed': 	thisWindowed ? true : false,
											'tower': 		isTower ? true : false,
											'stairs':		stairs ? true : false
										})
									)

								world.blockIdIterator++
							}

							world.blockHeightsArray.push(height)

							if (world.blockGroups.indexOf(blockGroup) === -1) {
								world.blockGroups.push(blockGroup)
							}

							world.map[y][x] = null

							let column = new Column(true, x, y, height)

							column.blockGroup = blockGroup
							column.height = height
							column.corner = false
							column.tileStack = tileStack

							world.map[y][x] = column
						}						
					}
				}
			}
		}

		return world.map
	}
	
	clearMapEdges(world: Map): any[][] {

		for (let y = 0; y < world.mapLength; y++) {
			for (let x = 0; x < world.mapWidth; x++) {
				if (x < world.mapEdgeWidth || x >= world.mapWidth - world.mapEdgeWidth ||
					y < world.mapEdgeWidth || y >= world.mapLength - world.mapEdgeWidth) {
					world.map[y][x] = null
					let column = new Column(false, x, y, 0)
					column.tileStack = []
					world.map[y][x] = column
				}
			}
		}

		return world.map
	}

	addBuildingComponent(world: Map): any[][] {

		if (world.blockAmountIterator < world.maxBlockIterations) {

			world.blockEdges = world.getEdges()

			if (world.blockEdges.length > 0) {			

				let nextHeight

				if (world.blockHeightVariation === BuildingHeightVariations.TallCenter) {
					nextHeight = world.blockHeight - (world.blockAmountIterator)
				} else if (world.blockHeightVariation === BuildingHeightVariations.TallSurrounds) {
					nextHeight = world.blockHeight + (world.blockAmountIterator * Math.ceil(Math.random() * 2))
				} else if (world.blockHeightVariation === BuildingHeightVariations.Random) {
					let randomNum = Math.ceil(Math.random() * 4)
					let randomAdd = Math.round(Math.random())
					if (randomAdd === 0 && world.blockHeight > 3) {
						nextHeight = world.blockHeight - randomNum
					} else {
						nextHeight = world.blockHeight + randomNum
					}				
				}

				if (nextHeight < 2) {
					nextHeight = 1
				} else if (nextHeight > world.mapMaxHeight) {
					nextHeight = world.mapMaxHeight
				}

				let randomEdgePoint = Math.floor(Math.random() * world.blockEdges.length)
				let creationPoint: Position = world.blockEdges[randomEdgePoint]
				let blockGroup = world.blockGroups.length + 1
				let manipulateExistingCols = (Math.round(Math.random()) < 1) ? false : true
				let nextBlockWidth = (world.averageBuildingSize ) + Math.floor(Math.random() * 5)
				let nextBlockLength = (world.averageBuildingSize ) + Math.floor(Math.random() * 5)
				let yStartOffset = 1 + Math.floor(Math.random() * 2)
				let hollowBuildingBlock = Math.round(Math.random()) === 1 ? true : false

				console.log('nextBlockWidth', nextBlockWidth)
				console.log('nextBlockLength', nextBlockLength)
				
				if (nextBlockWidth > 4 && nextBlockLength > 4) {
					hollowBuildingBlock = false // true
				} else {
					hollowBuildingBlock = false
				}

				console.log('creation y left: ', creationPoint.y - (nextBlockLength - yStartOffset))
				console.log('creation y right: ', creationPoint.y + (nextBlockLength))
				console.log('creation x left: ', creationPoint.x - (nextBlockWidth / 2))
				console.log('creation x right: ', creationPoint.x + (nextBlockWidth / 2))

				for (let y = 0; y < world.mapLength; y++) {
					for (let x = 0; x < world.mapWidth; x++) {

						let yConditions = x > (creationPoint.x - (nextBlockWidth / 2)) && x < (creationPoint.x + (nextBlockWidth / 2))
						let xConditions = (y > creationPoint.y - yStartOffset && y < creationPoint.y + nextBlockLength - yStartOffset)
						
						if (yConditions) {
							if (xConditions) {

								let createCol = true

								if (hollowBuildingBlock) {
									if (y > creationPoint.y + 1 && y < creationPoint.y + nextBlockLength - 1) {
										if ((x > (creationPoint.x - (nextBlockWidth / 2)) && x < creationPoint.x - (nextBlockWidth / 2) + 2)
											||
											(x < (creationPoint.x + (nextBlockWidth / 2)) && x > creationPoint.x - (nextBlockWidth / 2) - 2)) {
											createCol = false
										}
									}
								}

								if (createCol) {

									let tileStack = []

									for (let h = 0; h < nextHeight; h++) {

										let thisPillar = 0
										let thisWindowed = 0
										let isRoof = (h === nextHeight-1) ? true : false
										let tileColor = world.getFirstDefinedColumn().tileStack[0].tileColor

										if (h === world.lineHeight) {								
											tileColor = world.decorativeColors['lineColor']
										} else {
											tileColor = world.defaultColor
										}

										tileStack.push(
											new Tile(
												world.blockIdIterator, 
												x, 
												y, 
												h, 
												TileType.Body,
												tileColor,
												{
													'roof':			isRoof,
													'pillar': 		thisPillar,
													'windowed': 	thisWindowed,
													'tower': 		false
												})
											)								

										world.blockHeightsArray.push(nextHeight)

										world.blockIdIterator++
									}

									if (world.blockGroups.indexOf(blockGroup) === -1) {
										world.blockGroups.push(blockGroup)
									}

									world.map[y][x] = null

									let column = new Column(true, x, y, nextHeight)

									column.blockGroup = blockGroup
									column.height = nextHeight
									column.corner = false
									column.tileStack = tileStack

									world.map[y][x] = column	
								}
							}
						}
					}
				}

				world.blockHeight = nextHeight

				world.blockAmountIterator++

			} else {		
				console.warn("Block edges array is empty.")
			}

		} else {
			console.warn("Cannot add more building components, maximum block iterations reached.")
		}

		return world.map
	}	
}