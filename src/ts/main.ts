import Map from './mapper.component'
import Builder from './builder.component'

class RandomBuilding {

	private _map: Map
	private _builder: Builder = new Builder

	constructor() {
		this._map = new Map(25, 25, 10, 2, (4 + Math.floor(Math.random() * 7)), 2, 4)
	}

	get map() {
		return this._map
	}

	public colorMap(): string {
		return this._builder.showData(this._map) + this._builder.build2DMap(this._map)
	}

	public drawTile(): string {
		return this._builder.createTile()
	}
}

const building = new RandomBuilding();

console.log(building.map.map);
console.log("column on 15, 17: ", building.map.getColumn(15, 17))

//document.querySelector('#world').innerHTML = building.colorMap()
document.querySelector("#world").innerHTML = building.drawTile()