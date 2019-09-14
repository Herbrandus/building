import { Map } from './mapper.component'
import { Renderer } from './builder.component'
import { Color } from './mapGenerationFunctions.component'
import { Config } from './config.component'

class RandomBuilding {

	private _map: Map
	private _builder: Renderer = new Renderer
	private config: Config = new Config

	constructor() {
		this._map = new Map(30, 30, 10, 1, 6, 3, 4, false)
		document.querySelector('body').style.background = this.config.groundColor.hex()
	}

	public debug(): boolean {
		return this.config.allowDebug
	}

	get map() {
		return this._map
	}

	public colorMap(): string {
		return this._builder.build2DMap(this._map)
	}

	public addToBuildingAndRedraw(): string {
		this._map.addToBuilding()
		return this._builder.build2DMap(this._map)
	}

	public drawTileMap(): string {
		return this._builder.buildMap(this._map)
	}
}

let building = new RandomBuilding()
document.querySelector('#color').innerHTML = building.colorMap()
document.querySelector("#worldtest").innerHTML = building.drawTileMap()

document.querySelector('#generate').addEventListener('click', () => {
	building = new RandomBuilding()
	document.querySelector('#color').innerHTML = building.colorMap()
	document.querySelector("#worldtest").innerHTML = building.drawTileMap()
	document.querySelector('#debugActive').classList.remove('active')

	document.querySelectorAll('.point').forEach((item) => {
		item.addEventListener('click', () => {
			console.log('toggled', item)
			item.parentElement.classList.toggle('active')
		})		
	})
})

document.querySelector('#redraw').addEventListener('click', () => {
	building.addToBuildingAndRedraw()
	document.querySelector('#color').innerHTML = building.colorMap()
	document.querySelector("#worldtest").innerHTML = building.drawTileMap()
	document.querySelector('#debugActive').classList.remove('active')

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

document.querySelectorAll('.blockLabel').forEach((item) => {
	item.addEventListener('click', () => {
		item.classList.toggle('active')
	})
})

/*
const color = new Color(150, 225, 116);

const colorDivs = `
	<div class="color__tile" style="background-color: rgb(${color.getShadowsRGB().r},${color.getShadowsRGB().g},${color.getShadowsRGB().b})"></div>
	<div class="color__tile" style="background-color: rgb(${color.rgb().r},${color.rgb().g},${color.rgb().b})"></div>
	<div class="color__tile" style="background-color: rgb(${color.getHighlightsRGB().r},${color.getHighlightsRGB().g},${color.getHighlightsRGB().b})"></div>`

document.querySelector('#color').innerHTML = colorDivs */

/*
document.querySelector('#generate').addEventListener('click', () => {
	const building2 = new RandomBuilding();
	document.querySelector("#world").innerHTML = building2.drawTileMap()
	document.querySelector('#debugActive').classList.remove('active')

	document.querySelectorAll('.point').forEach((item) => {
		item.addEventListener('click', () => {
			console.log('toggled', item)
			item.parentElement.classList.toggle('active')
		})		
	})
})

document.querySelector('#debugActive').addEventListener('click', () => {
	document.querySelector('#debug').classList.toggle('show')
	document.querySelector('#debugActive').classList.toggle('active')
})

const building = new RandomBuilding();
document.querySelector("#world").innerHTML = building.drawTileMap()

document.querySelectorAll('.blockLabel').forEach((item) => {
	item.addEventListener('click', () => {
		item.classList.toggle('active')
	})
})

document.querySelectorAll('.showGroups').forEach((item) => {
	item.addEventListener('click', e => {
		e.stopPropagation()
		let group = item.getAttribute('data-group')
		let groups = document.querySelectorAll('.blockLabel[data-groupid="'+group+'"]')
		groups.forEach(point => {
			point.addEventListener('click', () => {
				item.classList.toggle('group__marker')
			})
		})

	})
})

if (!building.debug()) {
	document.querySelector('#debugActive').classList.add('hide')
}
*/

