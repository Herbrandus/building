import MapGenerator from './mapper.component'
import Builder from './builder.component'

class RandomBuilding {

	private _map: any[]
	private _mapGenerator: MapGenerator = new MapGenerator()

	constructor() {
		this._map = this._mapGenerator.createMap(25, 25, 10, 2, (4 + Math.floor(Math.random() * 6)), 2, 4)
	}

}

const building = new RandomBuilding();

console.log(building);