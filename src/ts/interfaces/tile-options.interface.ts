export interface TileOptions {
	roof: boolean,
	pillar: boolean,
	slope: string | boolean,
	windowed: number,
	tower: boolean,
	stairs:	boolean,
	halfArch: boolean,
	wholeArch: boolean,
	areaDecoration: string
}

export class TileOptionsFunctions {

	getDefaultTileOptions(
		roof: boolean = false,
		pillar: boolean = false,
		slope: string | boolean = false,
		windowed: number = 0,
		tower: boolean = false,
		stairs:	boolean = false,
		halfArch: boolean = false,
		wholeArch: boolean = false,
		areaDecoration: string = ''
	): TileOptions {
		return {
			roof,
			pillar,
			slope,
			windowed,
			tower,
			stairs,
			halfArch,
			wholeArch,
			areaDecoration
		}
	}

}