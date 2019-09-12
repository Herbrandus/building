import Map from './mapper.component'
import { Renderer } from './builder.component'
import { Color } from './mapGenerationFunctions.component'
import { Config } from './config.component'

class RandomBuilding {

	private _map: Map
	private _builder: Renderer = new Renderer
	private config: Config = new Config

	constructor(pyramid: boolean) {
		this._map = new Map(20, 20, 10, 2, (4 + Math.floor(Math.random() * 7)), 2, 4, pyramid)
		document.querySelector('body').style.background = this.config.groundColor.hex()
	}

	get map() {
		return this._map
	}

	public colorMap(): string {
		return this._builder.showData(this._map) + this._builder.build2DMap(this._map)
	}

	public drawTileMap(): string {
		return this._builder.buildMap(this._map)
	}
}

let allowPyramid = false

/*
const color = new Color(150, 225, 116);

const colorDivs = `
	<div class="color__tile" style="background-color: rgb(${color.getShadowsRGB().r},${color.getShadowsRGB().g},${color.getShadowsRGB().b})"></div>
	<div class="color__tile" style="background-color: rgb(${color.rgb().r},${color.rgb().g},${color.rgb().b})"></div>
	<div class="color__tile" style="background-color: rgb(${color.getHighlightsRGB().r},${color.getHighlightsRGB().g},${color.getHighlightsRGB().b})"></div>`

document.querySelector('#color').innerHTML = colorDivs */

document.querySelector('#generate').addEventListener('click', () => {
	const building2 = new RandomBuilding(allowPyramid);
	document.querySelector("#world").innerHTML = building2.drawTileMap()

	document.querySelectorAll('.blockLabel').forEach((item) => {
		item.addEventListener('click', () => {
			item.classList.toggle('active')
		})
	})
})

document.querySelector('#debugActive').addEventListener('click', () => {
	document.querySelector('#debug').classList.toggle('show')
	document.querySelector('#debugActive').classList.toggle('active')
})

const building = new RandomBuilding(allowPyramid);
document.querySelector("#world").innerHTML = building.drawTileMap()

document.querySelectorAll('.blockLabel').forEach((item) => {
	item.addEventListener('click', () => {
		item.classList.toggle('active')
	})
})