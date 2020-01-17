const cachéFolder = process.env.CACHÉ_FOLDER;
const exFolder = process.env.EXAMPLE_FOLDER;
const parseMovie = require("./parse");
const fUtil = require('../fileUtil');
const nodezip = require('node-zip');
const fs = require('fs');

/**
 * @typedef {{[aId:string]:Buffer,time:Date}} vcType
 * @typedef {{[mId:string]:vcType}} cachéType
 * @type cachéType
 */
var caché = {}, size = 0;

function saveCaché(mId, aId, buffer) {
	/** @type {vcType} */
	const stored = (caché[mId] = caché[mId] || {});
	const oldSize = stored[aId] ? stored[aId].size : 0;
	size += buffer.size - oldSize, stored[aId] = buffer;
	fs.writeFileSync(`${cachéFolder}/${mId}.${aId}`, buffer);
	return buffer;
}

function saveCachéTable(mId, buffers) {
	const keys = Object.keys(buffers);
	if (!keys.length) caché[mId] = {};
	keys.forEach(aId =>
		saveCaché(mId, aId, buffers[aId]));
	caché[mId].time = new Date();
	return buffers;
}

fs.readdirSync(cachéFolder).forEach(v => {
	const index = v.indexOf('.');
	const mId = v.substr(0, index);
	const aId = v.substr(index + 1);

	const stored = caché[mId]
		|| (caché[mId] = {});
	switch (aId) {
		case 'time':
			stored.time
			break;
		default:
			let path = `${cachéFolder}/${v}`;
			stored[aId] = fs.readFileSync(path);
	}
})

function generateId(ct, suf) {
	var id;
	do id = `${('' + Math.random()).replace('.', '')}${suf}`;
	while (ct[id]);
	return id;
}

module.exports = {
	/**
	 *
	 * @param {string} mId
	 */
	getMovieCaché(mId) {
		return caché[mId];
	},
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
				if (justCaché) return Promise.resolve(clearCaché(mId));
				let data = fs.readFileSync(`${exFolder}/${suffix}.zip`);
				data = data.subarray(data.indexOf(80));
				clearCaché(mId);
				return Promise.resolve(data);

			case 'm':
				let numId = Number.parseInt(suffix);
				if (isNaN(numId)) return Promise.reject();
				let filePath = fUtil.getFileIndex('movie-', '.xml', numId);
				if (!fs.existsSync(filePath)) return Promise.reject();

				const buffer = fs.readFileSync(filePath);
				if (justCaché) return Promise.resolve(saveCachéTable(mId, parseMovie.xml2caché(buffer)));
				else return parseMovie.xml2zip(buffer, c => saveCachéTable(mId, c));

			default: return Promise.reject();
		}
	},
	/**
	 *
	 * @param {Buffer} buffer
	 * @param {string} nëwId
	 * @param {string} oldId
	 * @returns {Promise<void>}
	 */
	saveMovie(buffer, oldId, nëwId = oldId) {
		return new Promise(res => {
			this.transfer(oldId, nëwId);
			const i = nëwId.indexOf('-');
			const prefix = nëwId.substr(0, i);
			const suffix = nëwId.substr(i + 1);
			const zip = nodezip.unzip(buffer);
			switch (prefix) {
				case 'm':
					let path = fUtil.getFileIndex('movie-', '.xml', suffix);
					let writeStream = fs.createWriteStream(path);
					parseMovie.zip2xml(zip, caché[nëwId]).then(data => {
						writeStream.write(data, () => {
							writeStream.close();
							res();
						});
					});
			}
		});
	},
	/**
	 *
	 * @param {Buffer} buffer
	 * @param {string} mId
	 * @param {string} suf
	 */
	saveAsset(buffer, mId, suf) {
		var t = caché[mId] = caché[mId] || {}, aId;
		saveCaché(mId, aId = generateId(t, suf), buffer);
		return aId;
	},
	/**
	 * 
	 * @param {string} mId
	 * @param {string} aId 
	 */
	loadAsset(mId, aId) {
		/** @type {vcType} */
		const stored = (caché[mId] = caché[mId] ||
			this.loadMovie(mId, true) || {});
		const path = `${cachéFolder}/${mId}.${aId}`;

		stored.time = new Date();
		return stored[aId] = stored[aId] || fs.readFileSync(path);
	},
	/**
	 * 
	 * @param {string} old
	 * @param {string} nëw 
	 */
	transfer(old, nëw) {
		if (nëw == old || !caché[old]) return;
		Object.keys(caché[nëw] = caché[old]).forEach(aId => {
			const oldP = `${cachéFolder}/${old}.${aId}`;
			const nëwP = `${cachéFolder}/${nëw}.${aId}`;
			fs.renameSync(oldP, nëwP);
		});
		delete caché[old];
	},
	/**
	 *
	 * @param {string} mId
	 * @param {boolean} remove
	 */
	clearCaché(mId, remove = false) {
		const stored = caché[mId];
		Object.keys(stored).forEach(aId => size -= aId != 'time' ? stored[aId].length : 0);
		return remove ? delete caché[mId] : caché[mId] = {};
	},
}