const parseMovie = require("./parse");
const fUtil = require('../fileUtil');
const nodezip = require('node-zip');
const fs = require('fs');

/**
 * @typedef {{[aId:string]:Buffer}} vcType
 * @typedef {{[nId:number]:vcType}} cachéType
 * @type cachéType
 */
var caché = {};

function generateId(t, ext) {
	var id;
	do id = `${('' + Math.random()).replace('.', '')}.${ext}`;
	while (t[id]);
	return id;
}

module.exports = {
	/**
	 * 
	 * @param {stirng} strId 
	 * @returns {Promise<Buffer>}
	 */
	loadMovieFromStr(strId) {
		const i = strId.indexOf('-');
		const prefix = strId.substr(0, i);
		const suffix = strId.substr(i + 1);
		switch (prefix) {
			case 'e':
				let data = fs.readFileSync(`examples/${suffix}.zip`);
				if (data[0] != 80) data = data.subarray(1);
				return Promise.resolve(data);
			case 'm':
				return this.loadMovieFromNum(Number.parseInt(suffix));
			default: Promise.reject();
		}
	},
	/**
	 *
	 * @param {number} numId
	 * @returns {Promise<Buffer>}
	 */
	loadMovieFromNum(numId) {
		const filePath = fUtil.getFileIndex('movie-', '.xml', numId);
		if (!fs.existsSync(filePath)) return Promise.reject();

		const t = caché[numId] || (caché[numId] = {});
		return parseMovie.xml2zip(fs.readFileSync(filePath), t);
	},
	/**
	 *
	 * @param {stirng} strId
	 */
	getNumId(movieId) {
		if (!movieId) return fUtil.
			getNextFileId('movie-', '.xml');
		const i = movieId.indexOf('-');
		const prefix = movieId.substr(0, i);
		const suffix = movieId.substr(i + 1);
		switch (prefix) {
			case 'm': case '': return Number.parseInt(suffix);
			case 'e': default: return fUtil.fillNextFileId('movie-', '.xml');
		}
	},
	/**
	 *
	 * @param {Buffer} buffer
	 * @param {number} numId
	 * @returns {Promise<void>}
	 */
	saveMovie(buffer, numId) {
		return new Promise(res => {
			const zip = nodezip.unzip(buffer);
			parseMovie.zip2xml(zip, caché[numId]).then(data => {
				writeStream.write(data, () => {
					writeStream.close();
					res();
				});
			});
		});
	},
	/**
	 *
	 * @param {Buffer} buffer
	 * @param {number} numId
	 * @param {string} ext
	 */
	saveAsset(buffer, numId, ext) {
		var t = caché[numId] || (caché[numId] = {});
		const id = generateId(t, ext);
		t[id] = buffer;
		return id;
	},
	/**
	 * 
	 * @param {number} numId 
	 * @param {string} assetId 
	 */
	loadAsset(numId, assetId) {
		const a = caché[numId][assetId];
		return a !== null ?
			Promise.resolve(a) :
			Promise.reject();
	},
}