export class Primitives {

	getPyramid(mapWidth: number, mapLength: number): number[][] {

		let map = [],
			width = Math.min(mapWidth, mapLength),
			height = Math.min(mapWidth, mapLength),
			widthHalf = Math.floor(width / 2),
			heightHalf = Math.floor(height / 2),
			quarter = [];

		for (let y = 0; y < width; y++) {
			map[y] = []
			for (let x = 0; x < height; x++) {
				if (y < Math.round(height / 2) && x < Math.round(width / 2)) {  
					map[y][x] = Math.min(y, x)
				} else {
					map[y][x] = Math.max(y, x)
				}
			}
		}

		for (let y = 0; y < widthHalf; y++) {
			quarter[y] = []
			for (let x = 0; x < heightHalf; x++) {
				if (y < heightHalf && x < widthHalf) { 
					quarter[y][x] = map[y][x]
				}
			}
		}

		let quarterRev = quarter.reverse()

		for (let y = 0; y < width; y++) {
			for (let x = 0; x < height; x++) {
			  	if (y > heightHalf - 1 && x < widthHalf) {
			    	map[y][x] = quarterRev[y - heightHalf][x]
			    }
			}
		}

		for (let y = 0; y < width; y++) {
			for (let x = 0; x < height; x++) {
			  	if (x > widthHalf - 1) {
			    	map[y][x] = map[y][width - x - 1]
			    }
		  	}
		}

		return map
	}
}