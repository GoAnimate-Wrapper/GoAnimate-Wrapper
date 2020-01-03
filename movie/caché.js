const exFolder = process.env.EXAMPLE_FOLDER;
const parseMovie = require("./parse");
const fUtil = require('../fileUtil');
const nodezip = require('node-zip');
const fs = require('fs');

/**
 * @typedef {{[aId:string]:Buffer}} vcType
 * @typedef {{[mId:string]:vcType}} cachéType
 * @type cachéType
 */
var caché = {}

function generateId(t, ext) {
	var id;
	do id = `${('' + Math.random()).replace('.', '')}.${ext}`;
	while (t[id]);
	return id;
}

module.exports = {
	/**
	 * 
	 * @param {string} mId 
	 * @param {boolean} justCaché
	 * @returns {Promise<Buffer|vcType>}
	 */
	loadMovie(mId, justCaché = false) {
		const i = mId.indexOf('-');
		const prefix = mId.substr(0, i);
		const suffix = mId.substr(i + 1);
		switch (prefix) {
			case 'e':
				if (justCaché)
					return Promise.resolve(caché[mId] = {});
				caché[mId] = {};
				let data = fs.readFileSync(`${exFolder}/${suffix}.zip`);
				data = data.subarray(data.indexOf(80));
				return Promise.resolve(data);

			case 'm':
				let numId = Number.parseInt(suffix);
				if (isNaN(numId)) return Promise.reject();
				let filePath = fUtil.getFileIndex('movie-', '.xml', numId);
				if (!fs.existsSync(filePath)) return Promise.reject();

				const buffer = fs.readFileSync(filePath);
				if (justCaché) return Promise.resolve(caché[mId] = parseMovie.xml2caché(buffer));
				else return parseMovie.xml2zip(buffer, c => caché[numId] = c);

			default: Promise.reject();
		}
	},
	/**
	 *
	 * @param {Buffer} buffer
	 * @param {string} mId
	 * @param {string} preId
	 * @returns {Promise<void>}
	 */
	saveMovie(buffer, mId, preId = mId) {
		this.transfer(preId, mId);
		return new Promise(res => {
			const zip = nodezip.unzip(buffer);
			parseMovie.zip2xml(zip, caché[mId]).then(data => {
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
	 * @param {string} mId
	 * @param {string} ext
	 */
	saveAsset(buffer, mId, ext) {
		var t = caché[mId] || (caché[mId] = {});
		const aId = generateId(t, ext);
		t[aId] = buffer;
		return aId;
	},
	/**
	 * 
	 * @param {string} mId
	 * @param {string} assetId 
	 */
	loadAsset(mId, assetId) {
		if (!(mId in caché))
			this.loadMovie(mId, true);
		const t = caché[mId];
		if (assetId in t)
			return Promise.resolve(t[assetId]);
		else return Promise.reject();
	},
	/**
	 * 
	 * @param {string} from
	 * @param {string} to 
	 */
	transfer(from, to) {
		if (from == to) return;
		caché[to] = caché[from];
		delete caché[from];
	},
}