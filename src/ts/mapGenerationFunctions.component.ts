export class MapGenerationFunctions {

	constructor() {}

	public calculateAdditionalBlockIterations(maximumBlockIterations: number) {
		return 2 + Math.floor(Math.random() * maximumBlockIterations)
	}
}

export enum TileColor {
	Red = 125 + Math.floor(Math.random() * 75),
	Green = 170 + Math.floor(Math.random() * 40),
	Blue = 180 + Math.floor(Math.random() * 30)
}

export enum BuildingHeightVariations {
	TallCenter = 'tallcenter', 
	TallSurrounds = 'tallsurrounds', 
	Random = 'random'
}