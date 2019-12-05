const path = require('path');

module.exports = {
	/**
	 * 
	 * @param {number} startId 
	 */
	maePath(startId) {
		return path.join('characters', this.padZero(startId) + '.txt');
	},
	/** 
	 * 
	 * @param {number} n 
	 * @param {number} l 
	 */
	padZero(n, l = process.env.FILE_NUM_WIDTH) {
		return ('' + n).padStart(l, '0');
	},
	/**
	 * 
	 * @param {string} temp 
	 * @param {string} info 
	 */
	fillTemplate(temp, info) {
		return temp.replace(/%s/g, info);
	},
}