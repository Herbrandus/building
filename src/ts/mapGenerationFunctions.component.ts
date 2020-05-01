import { Config } from './config.component'
import { Position } from './interfaces/position.interface'

export class MapGenerationFunctions {

	private config: Config = new Config();
	smallAngle = this.config.tileSmallAngle;
	largeAngle = this.config.tileLargeAngle;

	constructor() { }

	public calculateAdditionalBlockIterations(maximumBlockIterations: number) {
		return 2 + Math.floor(Math.random() * maximumBlockIterations);
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

		return {	'totalWidth': totalWidth, // 0
					'totalHeight': totalHeight,  // 1
					'horizontalWidthFromBottom': horizontalWidthFromBottom,  // 2
					'horizontalWidthFromTop': horizontalWidthFromTop,  // 3
					'verticalHeightFromBottom': verticalHeightFromBottom,  // 4
					'verticalHeightFromTop': verticalHeightFromTop } // 5
	}

	// calculate the amount of pixels from the bottom left side of a straight square to the point at the bottom 
	// .. where the tip of the tile meets the border of the square
	public getHorizontalBottomShortestWidth (diagonalWidth: number, smallAngle: number): number {
		return diagonalWidth * Math.sin(this.toRadians(smallAngle));
	}

	public getVerticalBottomShortestHeight (diagonalHeight: number, smallAngle: number): number {
		return diagonalHeight * Math.cos(this.toRadians(smallAngle));
	}

	public getHorizontalTopLongestWidth (diagonalWidth: number, largeAngle: number): number {
		return diagonalWidth * Math.sin(this.toRadians(largeAngle));
	}

	public getVerticalTopLongestHeight (diagonalHeight: number, largeAngle: number): number {
		return diagonalHeight * Math.cos(this.toRadians(largeAngle));
	}

	public addGradient(id: string, colorLeft: string, colorRight: string) {

		let gradient = '<linearGradient id="'+id+'">'
			gradient += '<stop offset="5%" stop-color="'+colorLeft+'" />'
			gradient += '<stop offset="95%" stop-color="'+colorRight+'" />'
			gradient += '</linearGradient>'

		return gradient
	}

	toRadians (angle: number): number {
		return angle * (Math.PI / 180);
	}

	public getHighestXfromArray(array: Position[]): Position {
		let highest: Position = {x: 0, y: 0}

		array.forEach(item => {
			if (item.x > highest.x) {
				highest = item
			}
		})

		return highest
	}

	public getHighestYfromArray(array: Position[]): Position {
		let highest: Position = {x: 0, y: 0}

		array.forEach(item => {
			if (item.y > highest.y) {
				highest = item
			}
		})

		return highest
	}

	public getLowestXfromArray(array: Position[]): Position {
		let highest = this.getHighestXfromArray(array)
		let lowest: Position = highest

		array.forEach(item => {
			if (item.x < lowest.x) {
				lowest = item
			}
		})

		return lowest
	}

	public getLowestYfromArray(array: Position[]): Position {
		let highest = this.getHighestYfromArray(array)
		let lowest: Position = highest

		array.forEach(item => {
			if (item.y < lowest.y) {
				lowest = item
			}
		})

		return lowest
	}
}
