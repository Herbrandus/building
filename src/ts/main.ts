import { Map } from './mapper.component'
import { Renderer } from './builder.component'
import { Color } from './mapGenerationFunctions.component'
import { Config } from './config.component'

class RandomBuilding {

	private _map: Map
	private _builder: Renderer = new Renderer
	private config: Config = new Config

	constructor() {
		this._map = new Map(30, 30, 10, 1, 5, 3, 4, false)
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

	public getBaseColor(): Color {
		const col = this.map.getFirstDefinedColumn()
		const tile = col.tileStack[col.tileStack.length-1]
		return tile.getColor()
	}

	public getImageTag(): void {
		if (document.querySelector('#buildingimg')) {
			document.querySelector('#buildingimg').remove()
		}

		let svg = new XMLSerializer().serializeToString(document.querySelector('svg'))
		let base64 = window.btoa(svg)

		let newImg = document.createElement('img')
		newImg.setAttribute('id', 'buildingimg')
		if (window['debug']) {
			newImg.setAttribute('class', 'debug-active')
		}
		newImg.setAttribute('src', 'data:image/svg+xml;base64,'+base64)
		
		let beforeElement = document.querySelector('#worldtest')
		let parent = document.querySelector("body")
		parent.insertBefore(newImg, beforeElement)		
	}
}

window['debug'] = false

window['activateDebug'] = () => { 
	window['debug'] = true
	document.querySelector('#color').classList.remove('hide')
	document.querySelector('#color-scheme').classList.remove('hide')
	if (document.querySelector('#buildingimg')) {
		document.querySelector('#buildingimg').classList.add('debug-active')
	}	
	document.querySelector('#color').innerHTML = building.colorMap()
}

let building = new RandomBuilding()

if (building.debug()) {
	window['activateDebug']();
}

document.querySelector("#worldtest").innerHTML = building.drawTileMap()
//building.getImageTag()

setColors(building)

document.querySelector('#generate').addEventListener('click', () => {
	building = new RandomBuilding()
	if (window['debug']) {
		document.querySelector('#color').innerHTML = building.colorMap()
	}	
	document.querySelector("#worldtest").innerHTML = building.drawTileMap()
	//building.getImageTag()

	document.querySelectorAll('.point').forEach((item) => {
		item.addEventListener('click', () => {
			console.log('toggled', item)
			item.parentElement.classList.toggle('active')
		})		
	})

	setColors(building)
})
/*
document.querySelector('#debugActive').addEventListener('click', () => {
	document.querySelector('#debug').classList.toggle('show')
	document.querySelector('#debugActive').classList.toggle('active')
})

document.querySelectorAll('.blockLabel').forEach((item) => {
	item.addEventListener('click', () => {
		item.classList.toggle('active')
	})
}) */

function setColors(building: RandomBuilding) {

	const color = building.getBaseColor()
	const shade0 = color.changeColorLightingString(0)
	const shade1 = color.changeColorLightingString(20)
	const shade2 = color.changeColorLightingString(-20)
	const shade3 = color.getColorStringByHue(60)
	const shade4 = color.getColorStringByHue(120)
	const shade5 = color.getColorStringByHue(180)
	const shade6 = color.getColorStringByHue(240)
	const shade7 = color.getColorStringByHue(300)

	const colorDivs = `
		<div class="color__tile" style="background-color:${shade0};"></div>
		<div class="color__tile" style="background-color:${shade1};"></div>
		<div class="color__tile" style="background-color:${shade3};"></div>
		<div class="color__tile" style="background-color:${shade4};"></div>
		<div class="color__tile" style="background-color:${shade5};"></div>
		<div class="color__tile" style="background-color:${shade6};"></div>
		<div class="color__tile" style="background-color:${shade7};"></div>`

	document.querySelector('#color-scheme').innerHTML = colorDivs
}
/*
document.querySelector('#download').addEventListener('click', () => {
	let svg = new XMLSerializer().serializeToString(document.querySelector('svg'))
	let base64 = window.btoa(svg)

	let newImg = document.createElement('img')
	newImg.setAttribute('src', 'data:image/svg+xml;base64,'+base64)
	document.querySelector('body').appendChild(newImg)
}); */