import MapGenerator from './mapper.component'
import Builder from './builder.component'

class RandomBuilding {

	_map: any[]
	_mapGenerator: MapGenerator

	constructor() {
		this._map = this._mapGenerator.createMap(25, 25, 10, 2, (4 + Math.floor(Math.random() * 6)), 2, 4)

		console.log('test')
		console.log(this._map)
	}

}

const building = new RandomBuilding();

console.log(building);