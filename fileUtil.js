const fs = require('fs');

module.exports = {
	/** 
	 * 
	 * @param {number} n 
	 * @param {number} l
	 * @returns {string}
	 */
	padZero(n, l = process.env.FILE_NUM_WIDTH) {
		return ('' + n).padStart(l, '0');
	},
	/**
	 * 
	 * @param {string} temp 
	 * @param {string} info
	 * @returns {string}
	 */
	fillTemplate(temp, info) {
		return temp.replace(/%s/g, info);
	},
	/**
	 * @param {string} s
	 * @param {string} ext
	 * @param {number} l
	 * @returns {string}
	 */
	getNextFile(s, ext = '.xml', l = 7) {
		const regex = new RegExp(`[^/]*/${s}.*${ext}`);
		const dir = fs.readdirSync(process.env.FILE_FOLDER).filter(v => v && regex.test(v));
		return `${process.env.FILE_FOLDER}/${s}${this.padZero(dir.length, l)}${ext}`;
	},
	/**
	 * @param {string} s
	 * @param {string} ext
	 * @param {number} n
	 * @param {number} l
	 * @returns {string}
	 */
	getFileIndex(s, ext = '.xml', n, l = 7) {
		return `${process.env.FILE_FOLDER}/${s}${this.padZero(n, l)}${ext}`;
	},
}