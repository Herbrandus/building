import { Map, Column } from './mapper.component'
import { Config } from './config.component'
import { Tile, TileType, TileOptions } from './tile.component'

export class Decorations {

	private config: Config = new Config()

	constructor() {}

	public placeRandomTrees(world: Map) {

		const randomAmount = Math.floor(Math.random() * 6)		
		const yPlacement = []
		const xPlacement = []

		for (let t = 0; t < randomAmount; t++) {
			yPlacement.push(Math.floor(5 + Math.random() * (world.mapLength - 5)))
		}

		console.log('placing on: ' + yPlacement)

		for (let y = 0; y < world.mapLength; y++) {

			if (y > 1 && y < world.mapLength - 2) {

				let loopCount = 0
				let i = 0

				if (yPlacement.includes(y)) {
					yPlacement.forEach(value => {
						if (value === y) {
							loopCount++
						}
					})
				}

				for (let x = 1; x < world.mapWidth; x++) {

					if (x > 2 && x < world.mapWidth - 3) {

						if (!world.map[y][x].isDefined &&
							!world.map[y-1][x].isDefined &&
							!world.map[y+1][x].isDefined &&
							!world.map[y][x-2].isDefined &&
							!world.map[y][x+2].isDefined) {

							const chance = Math.floor(Math.random() * 200)

							if (chance > 160 && i < loopCount && xPlacement.indexOf(x) === -1) {

								let decoration = new Column(true, x, y, 0)
									decoration.tileStack = [new Tile(
														10000 + i, 
														x, 
														y, 
														0, 
														TileType.None,
														this.config.groundColor,
														{
															roof:		false,
															pillar: 	false,
															slope:		false,
															windowed: 	0,
															tower: 		false,
															stairs:		false,
															halfArch: 	false,
															wholeArch:	false,
															areaDecoration: 'tree'
														})]
								

								world.map[y][x] = decoration

								xPlacement.push(x)

								i++;
							}
						}
					}				
				}
			}			
		}

		return world.map
	}
}