import { Map, Column } from './mapper.component'
import { MapGenerationFunctions, BuildingHeightVariations, Color } from './mapGenerationFunctions.component'
import { Tile, TileType, TileOptions } from './tile.component'
import { Config, Position } from './config.component'

export class Modifiers {

	private config: Config = new Config()
	private _lastBlockHollow: boolean = false

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

								let thisPillar
								let slope
								let thisWindowed
								let isTower
								let stairs
								let isRoof
								let halfArches
								let wholeArch

								if (activeCol.tileStack[h].options) {
									thisPillar = activeCol.tileStack[h].options.pillar
									slope = activeCol.tileStack[h].options.slope
									thisWindowed = activeCol.tileStack[h].options.windowed
									isTower = activeCol.tileStack[h].options.tower
									stairs = activeCol.tileStack[h].options.stairs
									isRoof = (h === height-1) ? true : false
									halfArches = activeCol.tileStack[h].options.halfArch
									wholeArch = activeCol.tileStack[h].options.wholeArch

									tileStack.push(
										new Tile(
											world.blockIdIterator, 
											x, 
											y, 
											h, 
											activeCol.tileStack[h].type,
											tileColor,
											{
												roof: isRoof,
												pillar: thisPillar,
												slope: slope,
												windowed: thisWindowed,
												tower: isTower,
												stairs:	stairs,
												halfArch: halfArches,
												wholeArch: wholeArch
											}
										)
									)
									
								} else {
									tileStack.push(
										new Tile(
											world.blockIdIterator, 
											x, 
											y, 
											h, 
											activeCol.tileStack[h].type,
											tileColor											
										)
									)
								}
								

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
						} else if(height === 0 && activeCol.isDefined) {
							world.map[y][x] = activeCol
						}					
					}
				}
			}
		}

		return world.map
	}
	
	clearMapEdges(world: Map): any[][] {

		for (let y = 0; y < world.mapLength; y++) {
			for (let x = 1; x < world.mapWidth; x++) {
				if (x < world.mapEdgeWidth || x >= world.mapWidth ||
					y < world.mapEdgeWidth || y >= world.mapLength - world.mapEdgeWidth) {
					if (world.map[y][x].isDefined && world.map[y][x].height > 0) {
						world.map[y][x] = null
						let column = new Column(false, x, y, 0)
						column.tileStack = []
						world.map[y][x] = column
					}					
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
				let openFloor = 0
				let showWindows = world.showWindows

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

				if (nextHeight > 5) {
					openFloor = 2 + Math.floor(Math.random() * 3)
				}

				let randomEdgePoint = Math.floor(Math.random() * world.blockEdges.length)
				let creationPoint: Position = world.blockEdges[randomEdgePoint]
				let blockGroup = world.blockGroups.length + 1
				let manipulateExistingCols = (Math.round(Math.random()) < 1) ? false : true
				let nextBlockWidth = (world.averageBuildingSize ) + Math.floor(Math.random() * 5)
				let nextBlockLength = (world.averageBuildingSize ) + Math.floor(Math.random() * 5)
				let yStartOffset = 1 + Math.floor(Math.random() * 2)
				let hollowBuildingBlock = Math.round(Math.random()) === 1 ? true : false

				if (creationPoint.y + nextBlockLength - yStartOffset > world.mapLength - 1) {
					nextBlockLength = world.mapLength - (creationPoint.y + yStartOffset) - 1
				}
				
				if (nextBlockWidth > 4 && nextBlockLength > 4) {
					if (!this._lastBlockHollow) {
						hollowBuildingBlock = Math.round(Math.random() * 8) > 5 ? true : false
						this._lastBlockHollow = true
					} else {
						hollowBuildingBlock = false
						this._lastBlockHollow = false
					}					
				} else {
					hollowBuildingBlock = false
				}

				let chanceForHigherSpace = Math.round(Math.random() * 8)
				let changeForHighCorridor = true // Math.round(Math.random() * 8) > 5 ? true : false

				let yLowEdge = creationPoint.y - yStartOffset + 1
				let yHighEdge = creationPoint.y + nextBlockLength - yStartOffset - 1
				let xLowEdge = creationPoint.x - (nextBlockWidth / 2) + 1
				let xHighEdge = creationPoint.x + (nextBlockWidth / 2) - 1
				let yEdgeLowActive = false
				let yEdgeHighActive = false

				let createTower = (nextHeight < 7 && Math.round(Math.random() * 8) > 5) ? true : false
				let towerLocation = 0
				if (createTower) {
					towerLocation = Math.round(Math.random() * 2)
				}

				let defaultTileColor = world.getFirstDefinedColumn().tileStack[0].tileColor

				console.log('nextBlockLength: ', nextBlockLength)

				for (let y = 0; y < world.mapLength; y++) {	

					if (yLowEdge === y) {
						yEdgeLowActive = true
					} else if (yHighEdge === y) {
						yEdgeHighActive = true
					} else {
						yEdgeLowActive = false
						yEdgeHighActive = false
					}

					let xEdgeLowActive = false
					let xEdgeHighActive = false

					for (let x = 0; x < world.mapWidth; x++) {

						if (x === xLowEdge) {
							xEdgeLowActive = true
						} else if (x === xHighEdge) {
							xEdgeHighActive = true
						}

						if (y >= yLowEdge && y <= yHighEdge) {

							if (x >= xLowEdge && x <= xHighEdge) {

								let createCol = true

								if (hollowBuildingBlock) {
									if (y > yLowEdge && y < yHighEdge && x > xLowEdge+1 && x < xHighEdge-1) {
										createCol = false
									}
								}

								if (createCol) {

									let buildTowerHere = false

									if (createTower) {
										if (towerLocation === 0) {
											if (y <= yLowEdge + 1 && x <= xLowEdge + 1) {
												buildTowerHere = true
											}
										} else if (towerLocation === 1) {
											if (y <= yLowEdge + 1 && x >= xHighEdge - 1) {
												buildTowerHere = true
											}
										} else if (towerLocation === 2) {
											if (y >= yHighEdge - 1 && x >= xHighEdge - 1) {
												buildTowerHere = true
											}
										}
									}

									let thisHeight = nextHeight
									if (buildTowerHere) {
										thisHeight = nextHeight + 5
									}

									let tileStack = []

									for (let h = 0; h < thisHeight; h++) {

										let thisPillar = false
										let thisWindowed = 0
										if (showWindows > 0 && h % 2 === 1) {
											thisWindowed = showWindows
										}	
										let isRoof = (h === thisHeight-1) ? true : false
										let slope = false
										let tileColor = defaultTileColor									
										let tileType = TileType.Body										
										let isTower = false
										if (buildTowerHere) {
											isTower = true
										}
										let stairs = false
										let thisHalfArch = false
										let thisWholeArch = false

										if (thisHeight > 4) {
											if (changeForHighCorridor) {

												if (nextBlockLength > 4 && nextBlockLength < 6) {

													let maxWallPoint = creationPoint.y + 5
													if (creationPoint.y + 5 > creationPoint.y + (nextBlockLength / 2)) {
														maxWallPoint = creationPoint.y + 4
													}

													if (y > creationPoint.y + 1 && y < maxWallPoint) {
														if (h < thisHeight - 2) {
															tileType = TileType.None

															if (creationPoint.y + 5 > 27) {
																if (y % 2 === 0 && x % 2 !== 0) {
																	thisPillar = true
																}																
															}

															if (h === thisHeight - 3) {
																thisHalfArch = true
															}
														}
													} 
												}

												if (nextBlockLength === 6) {
													if (y === yLowEdge + 1 || 
														y === yLowEdge + 2 ||
														y === yHighEdge - 2 ||
														y === yHighEdge - 3) {
														if (h < thisHeight - 2) {
															tileType = TileType.None
														}
														if (h === thisHeight - 3) {
															thisHalfArch = true
														}													
													}
												}

												if (nextBlockLength === 8) {
													if (y === yLowEdge + 1 || 
														y === yLowEdge + 2 ||
														y === yLowEdge + 4 ||
														y === yLowEdge + 5) {
														if (h < thisHeight - 2) {
															tileType = TileType.None
														}
														if (h === thisHeight - 3) {
															thisHalfArch = true
														}
													} else if (y === yLowEdge + 3 || y === yLowEdge + 6) {
														tileType = TileType.Body
														thisHalfArch = false
													}
												}

											} else {
												if (chanceForHigherSpace > 4) {
													if (openFloor > 0 && (h === openFloor || h+1 === openFloor)) {
														tileType = TileType.None
														if (y % 2 === 0 && x % 2 !== 0) {
															thisPillar = true
														}
													}
												} else {
													if (thisHeight > 7 && openFloor > 0 && h > openFloor && h < openFloor + 4) {
														tileType = TileType.None
														if (y % 2 === 0 && x % 2 !== 0) {
															thisPillar = true
														}
													}
												}
											}
										}																				

										if (h === world.lineHeight) {								
											tileColor = world.decorativeColors['lineColor']
										} else if (h === 0) {
											tileColor = world.firstLevelColor
										} else {
											tileColor = world.defaultColor
										}

										tileStack.push(
											new Tile(
												world.blockIdIterator, 
												x, 
												y, 
												h, 
												tileType,
												tileColor,
												{
													roof: isRoof,
													pillar: thisPillar,
													slope: slope,
													windowed: thisWindowed,
													tower: isTower,
													stairs:	stairs,
													halfArch: thisHalfArch,
													wholeArch: thisWholeArch
												})
											)								

										world.blockHeightsArray.push(thisHeight)

										world.blockIdIterator++

										tileColor = undefined
									}

									if (world.blockGroups.indexOf(blockGroup) === -1) {
										world.blockGroups.push(blockGroup)
									}

									world.map[y][x] = null

									let column = new Column(true, x, y, thisHeight)

									column.blockGroup = blockGroup
									column.height = thisHeight
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

				if (1 === 1) {

					for (let y = 0; y < world.mapLength; y++) {
						for (let x = 0; x < world.mapWidth; x++) {

							if (x < world.mapWidth - 2 && x > 2) {
								if (y < world.mapLength - 2 && y > 2) {

									if (world.map[y][x].isDefined && 
										world.map[y-1][x].isDefined &&
										world.map[y+1][x].isDefined &&
										world.map[y][x-1].isDefined &&
										world.map[y][x+1].isDefined) {

										if (world.map[y][x].height > 4) {
											if (world.map[y-1][x].blockGroup !== blockGroup) {
												world.map[y][x].tileStack[world.map[y][x].height-1].type = TileType.HalfBlock
											}	
										}								
									}		
								}	
							}							
						}
					}
				}

			} else {		
				console.warn("Block edges array is empty.")
			}

		} else {
			console.warn("Cannot add more building components, maximum block iterations reached.")
		}

		return world.map
	}	
}