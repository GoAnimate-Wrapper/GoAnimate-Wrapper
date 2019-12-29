const parseMovie = require("./parseMovie");
const nodezip = require('node-zip');
const fUtil = require('./fileUtil');
const fs = require('fs');

/**
 * @typedef {{[k:string]:string}} metaType
 * @typedef {{[aId:string]:{meta:metaType,buffer:Buffer}}} vcType
 * @typedef {{[nId:number]:vcType}} cachéType
 * @type cachéType
 */
var caché = {};
exports.caché = caché;

function generateId() {
	var id;
	do id = ('' + Math.random()).replace('.', '');
	while (caché[id]);
	return id;
}

module.exports = {
	loadMovieFromStr(strId) {
		caché[strId] = {};
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
		}
	},
	loadMovieFromNum(nId) {
		const zip = nodezip.create();
		const filePath = fUtil.getFileIndex('movie-', '.xml', nId);
		if (!fs.existsSync(filePath)) return Promise.reject();
		return parseMovie(zip, fs.readFileSync(filePath), caché);
	},
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
	saveXmlStream(stream, numId) {
		return new Promise(res => {
			const writeStream = fs.createWriteStream(
				fUtil.getFileIndex('movie-', '.xml', numId));

			var buffers = [];
			stream.on('data', b => buffers.push(b));
			stream.on('end', () => {
				var data = Buffer.concat(buffers).slice(0, -7);
				const t = caché[numId];

				for (const assetId in t)
					if (data.includes(assetId)) {
						var asset = t[assetId];
						var infoStr = Object.keys(asset.meta).map(k => `${k}="${asset.meta[k]}"`);
						data = Buffer.concat([data, Buffer.from(`<asset ${infoStr} id="${assetId}">${
							asset.buffer.toString('base64')}</asset>`)]);
					}
					else
						delete t[assetId];
				data.write(`</film>`);

				writeStream.write(data, () => {
					writeStream.close();
					res();
				});
			});
		});
	},
	async saveMovie(buffer, meta, id) {
		const zip = nodezip.unzip(buffer);
		return await this.saveXmlStream(zip['movie.xml'].toReadStream(), id);
	},
	saveAsset(numId, buffer, meta) {
		const id = generateId();
		if (!caché[numId])
			caché[numId] = {};
		var t = caché[numId];
		t[id] = buffer;
		return id;
	},
	/**
	 * 
	 * @param {number} numId 
	 * @param {string} assetId 
	 */
	loadAsset(numId, assetId) {
		return caché[numId][assetId];
	},
}