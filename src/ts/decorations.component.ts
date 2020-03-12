import { Map, Column } from './mapper.component'
import { Config } from './config.component'
import { Tile, TileType, TileOptions } from './tile.component'

export class Decorations {

	private config: Config = new Config()

	constructor() {}

	public placeRandomTrees(world: Map) {

		const randomAmount = Math.floor(Math.random() * 8);
		let i = 0;
		const yPlacement = []

		for (let t = 0; t < randomAmount; t++) {
			yPlacement.push(Math.floor(5 + Math.random() * (world.mapLength - 5)))
		}

		for (let y = 0; y < world.mapLength; y++) {
			for (let x = 1; x < world.mapWidth; x++) {

				if (!world.map[y][x].isDefined) {

					const chance = Math.floor(Math.random() * 20)

					if (chance > 10 && i < randomAmount) {

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

						console.log('placed tree on y = ' + y + ', x = ' + x)

						i++;
					}
				}
			}
		}

		return world.map
	}
}