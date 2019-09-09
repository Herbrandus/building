import { Config } from './config.component'

export class MapGenerationFunctions {

	private config: Config = new Config()
	smallAngle = this.config.tileSmallAngle
	largeAngle = this.config.tileLargeAngle

	constructor() { }

	public calculateAdditionalBlockIterations(maximumBlockIterations: number) {
		return 2 + Math.floor(Math.random() * maximumBlockIterations)
	}

	public calculateTriangleHypotenuse(adjacent: number, opposite: number): number {
		let sum = Math.pow(adjacent, 2) + Math.pow(opposite, 2)
		let result = Math.sqrt(sum)
		return result
	}	

	// calculate the dimensions to draw the isometric perspective tile with the parameters as if it were a straight square tile
	public calculateStraightLinesFromIsometricSquare (blockWidth: number, blockHeight: number) {
		// lengths this function returns when it comes to positions of longest and shortest sides as array
		/*           [0]
		 *   _________________ 
		 *   |    [3]  |      |
		 *   | [5]            |
		 *   |               -|
		 *   |-               | [1]
		 *   | [4]            |
		 *   |    [2]         |
		 *   |_______|________|
		 */  

		let smallOuterAngle = (180 - this.smallAngle) / 2;
		let largeOuterAngle = (180 - this.largeAngle) / 2;

		let horizontalWidthFromBottom = this.getHorizontalBottomShortestWidth(blockWidth, smallOuterAngle);
		let verticalHeightFromBottom = this.getVerticalBottomShortestHeight(horizontalWidthFromBottom, smallOuterAngle);

		let horizontalWidthFromTop = this.getHorizontalTopLongestWidth(blockHeight, largeOuterAngle);
		let verticalHeightFromTop = this.getVerticalTopLongestHeight(horizontalWidthFromTop, largeOuterAngle);

		let totalHeight = verticalHeightFromBottom + verticalHeightFromTop;
		let totalWidth = horizontalWidthFromBottom + horizontalWidthFromTop;

		return {	'totalWidth': totalWidth, 
					'totalHeight': totalHeight, 
					'horizontalWidthFromBottom': horizontalWidthFromBottom, 
					'horizontalWidthFromTop': horizontalWidthFromTop, 
					'verticalHeightFromBottom': verticalHeightFromBottom, 
					'verticalHeightFromTop': verticalHeightFromTop }
	}

	// calculate the amount of pixels from the bottom left side of a straight square to the point at the bottom 
	// .. where the tip of the tile meets the border of the square
	public getHorizontalBottomShortestWidth (diagonalWidth: number, smallAngle: number) {
		return Math.ceil((diagonalWidth * Math.sin(this.toRadians(smallAngle))) * 100) / 100;
	}

	public getVerticalBottomShortestHeight (diagonalHeight: number, smallAngle: number) {
		return Math.ceil((diagonalHeight * Math.cos(this.toRadians(smallAngle))) * 100) / 100;
	}

	public getHorizontalTopLongestWidth (diagonalWidth: number, largeAngle: number) {
		return Math.floor((diagonalWidth * Math.sin(this.toRadians(largeAngle))) * 100) / 100;
	}

	public getVerticalTopLongestHeight (diagonalHeight: number, largeAngle: number) {
		return Math.ceil(diagonalHeight * Math.cos(this.toRadians(largeAngle)));
	}

	toRadians (angle) {
		return angle * (Math.PI / 180);
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