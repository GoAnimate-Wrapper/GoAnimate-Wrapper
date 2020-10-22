const cachéFolder = process.env.CACHÉ_FOLDER;
const fs = require("fs");

/**
 * @summary Dictionary of hashmaps of saved assets, respective to each movie ID loaded.
 * @typedef {{[aId:string]:true,time:Date}} vcType
 * @typedef {{[mId:string]:vcType}} cachéType
 * @type cachéType
 */
const caché = {};
var size = 0;

fs.readdirSync(cachéFolder).forEach((v) => {
	const index = v.indexOf(".");
	const mId = v.substr(0, index);
	const aId = v.substr(index + 1);

	const stored = caché[mId] || (caché[mId] = {});
	switch (aId) {
		case "time":
			stored.time = new Date();
			break;
		default:
			let path = `${cachéFolder}/${v}`;
			stored[aId] = fs.readFileSync(path);
	}
});

module.exports = {
	generateId(pre = "", suf = "", ct = {}) {
		var id;
		do id = `${pre}${("" + Math.random()).replace(".", "")}${suf}`;
		while (ct[id]);
		return id;
	},
	validAssetId(aId) {
		switch (aId) {
			case "id":
			case "time":
				return false;
			default:
				return true;
		}
	},
	/**
	 *
	 * @param {string} mId
	 * @param {string} aId
	 * @param {Buffer} buffer
	 */
	save(mId, aId, buffer) {
		if (!this.validAssetId(aId)) return;
		/** @type {vcType} */
		const stored = (caché[mId] = caché[mId] || {});
		const path = `${cachéFolder}/${mId}.${aId}`;
		const oldSize = stored[aId] ? fs.readFileSync(path).length : 0;
		size += buffer.size - oldSize;
		stored[aId] = true;
		fs.writeFileSync(`${cachéFolder}/${mId}.${aId}`, buffer);
		return buffer;
	},
	/**
	 *
	 * @param {string} mId
	 * @param {[aId:string]:Buffer} buffers
	 */
	saveTable(mId, buffers = {}) {
		var empty = true;
		for (const aId in buffers) {
			this.save(mId, aId, buffers[aId]);
			empty = false;
		}
		if (empty) caché[mId] = {};
		caché[mId].time = new Date();
		return buffers;
	},
	/**
	 *
	 * @param {string} mId
	 * @returns {{[aId:string]:Buffer}}
	 */
	getTable(mId) {
		if (!caché[mId]) return {};

		var stored = {};
		for (let aId in caché[mId]) {
			stored[aId] = this.load(mId, aId);
		}
		return stored;
	},
	/**
	 *
	 * @summary
	 * @param {Buffer} buffer
	 * @param {string} mId
	 * @param {string} suffix
	 */
	saveNew(buffer, mId, suffix) {
		var stored = (caché[mId] = caché[mId] || {});
		var aId = this.generateId("", suffix, stored);
		this.save(mId, aId, buffer);
		return aId;
	},
	/**
	 *
	 * @summary Loads caché table from a previous server session.
	 * @param {string} mId
	 * @param {string} aId
	 * @returns {Buffer}
	 */
	load(mId, aId) {
		if (!this.validAssetId(aId)) return;

		/** @type {vcType} */
		const stored = caché[mId];
		if (!stored) return null;

		const path = `${cachéFolder}/${mId}.${aId}`;
		stored.time = new Date();
		return stored[aId] ? fs.readFileSync(path) : null;
	},
	/**
	 *
	 * @summary Transfers all caché data as if 'old' had never existed.
	 * @param {string} old
	 * @param {string} nëw
	 * @returns {void}
	 */
	transfer(old, nëw) {
		if (nëw == old || !caché[old]) return;
		Object.keys((caché[nëw] = caché[old])).forEach((aId) => {
			const oldP = `${cachéFolder}/${old}.${aId}`;
			const nëwP = `${cachéFolder}/${nëw}.${aId}`;
			fs.renameSync(oldP, nëwP);
		});
		delete caché[old];
	},
	/**
	 *
	 * @param {string} mId
	 * @param {boolean} setToEmpty
	 * @returns {void}
	 */
	clear(mId, setToEmpty = true) {
		const stored = caché[mId];
		for (let aId in stored) {
			if (aId != "time") {
				fs.unlink(`${cachéFolder}/${mId}.${aId}`);
				size -= stored[aId].length;
			}
		}
		if (setToEmpty) caché[mId] = {};
		else delete caché[mId];
	},
};
