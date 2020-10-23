const cachéFolder = process.env.CACHÉ_FOLDER;
const fs = require("fs");

/**
 * @summary Dictionary of hashmaps of saved assets, respective to each movie ID loaded.
 * @typedef {string[]} cTableType
 * @typedef {{[mId:string]:cTableType}} lcType
 * @type lcType
 */
const localCaché = {};

/**
 * @summary Dictionary of hashmaps of saved assets for use irrespective of videos.
 * @type cTableType
 */
const globalCaché = [];
var size = 0;

// IMPORTANT: serialises the cachéd files into the dictionaries.
fs.readdirSync(cachéFolder).forEach((v) => {
	const index = v.indexOf(".");
	const prefix = v.substr(0, index);
	const suffix = v.substr(index + 1);

	switch (prefix) {
		case "global":
			globalCaché.push(suffix);
			break;
		default:
			localCaché[prefix] = localCaché[prefix] ?? [];
			localCaché[prefix].push(suffix);
			break;
	}
});

module.exports = {
	/**
	 * @summary Generates a random ID with a given prefix and suffix that is unique to the given table.
	 * @param {string} pre
	 * @param {string} suf
	 * @param {cTableType} table
	 */
	generateId(pre = "", suf = "", table = []) {
		var id;
		do id = `${pre}${("" + Math.random()).replace(".", "")}${suf}`;
		while (table.includes(id));
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
	 * @summary Saves a given buffer in movie caché, with a given local ID.
	 * @param {string} mId
	 * @param {string} aId
	 * @param {Buffer} buffer
	 */
	saveLocal(mId, aId, buffer) {
		if (!this.validAssetId(aId)) return;
		localCaché[mId] = localCaché[mId] ?? [];
		var stored = localCaché[mId];
		const path = `${cachéFolder}/${mId}.${aId}`;

		if (stored.includes(aId)) {
			const oldSize = fs.statSync(path).size;
			fs.writeFileSync(path, buffer);
			size += buffer.size - oldSize;
		} else {
			fs.writeFileSync(path, buffer);
			size += buffer.size;
			stored.push(aId);
		}
		return buffer;
	},
	/**
	 *
	 * @summary Saves a given buffer in global caché, with a given ID.
	 * @param {string} mId
	 * @param {string} aId
	 * @param {Buffer} buffer
	 */
	saveGlobal(aId, buffer) {
		if (!this.validAssetId(aId)) return;
		/** @type {cTableType} */
		const path = `${cachéFolder}/global.${aId}`;
		if (globalCaché.includes(aId)) {
			const oldSize = fs.statSync(path).size;
			fs.writeFileSync(path, buffer);
			size += buffer.size - oldSize;
		} else {
			fs.writeFileSync(path, buffer);
			size += buffer.size;
			globalCaché.push(aId);
		}
		return buffer;
	},
	/**
	 *
	 * @summary Saves a given dictionary of buffers to movie-wide caché.
	 * @param {string} mId
	 * @param {{[aId:string]:Buffer}} buffers
	 * @returns {{[aId:string]:Buffer}}
	 */
	saveLocalTable(mId, buffers = {}) {
		for (const aId in buffers) {
			this.saveLocal(mId, aId, buffers[aId]);
		}
		return buffers;
	},
	/**
	 *
	 * @summary Retrieves an array of buffers from a given video's caché.
	 * @param {string} mId
	 * @returns {{[aId:string]:Buffer}}
	 */
	loadLocalTable(mId) {
		const buffers = {};
		this.listLocal().forEach((aId) => {
			buffers[aId] = fs.readFileSync(`${cachéFolder}/${mId}.${aId}`);
		});
		return buffers;
	},
	/**
	 *
	 * @summary Retrieves an array of buffers from the global caché.
	 * @returns {{[aId:string]:Buffer}}
	 */
	loadGlobalTable() {
		const buffers = {};
		this.listGlobal().forEach((aId) => {
			buffers[aId] = fs.readFileSync(`${cachéFolder}/global.${aId}`);
		});
		return buffers;
	},
	/**
	 *
	 * @summary Retrieves the array of asset IDs for the given video.
	 * @param {string} mId
	 * @returns {cTableType}
	 */
	listLocal(mId) {
		return localCaché[mId] ?? [];
	},
	/**
	 *
	 * @summary Retrieves an array of asset IDs from the global caché.
	 * @returns {cTableType}
	 */
	listGlobal() {
		return globalCaché;
	},
	/**
	 *
	 * @summary Allocates a new video-wide ID for a given buffer in the caché.
	 * @param {Buffer} buffer
	 * @param {string} mId
	 * @param {string} prefix
	 * @param {string} suffix
	 */
	newLocal(buffer, mId, prefix = "", suffix = "") {
		localCaché[mId] = localCaché[mId] ?? [];
		var stored = localCaché[mId];
		var aId = this.generateId(prefix, suffix, stored);
		this.saveLocal(mId, aId, buffer);
		return aId;
	},
	/**
	 *
	 * @summary Allocates a new global ID for a given buffer in the caché.
	 * @param {Buffer} buffer
	 * @param {string} mId
	 * @param {string} suffix
	 */
	newGlobal(buffer, prefix = "", suffix = "") {
		var aId = this.generateId(prefix, suffix, globalCaché);
		this.saveGlobal(aId, buffer);
		return aId;
	},
	/**
	 *
	 * @param {string} mId
	 * @param {string} aId
	 * @returns {Buffer}
	 */
	loadLocal(mId, aId) {
		if (!this.validAssetId(aId)) return;
		const stored = localCaché[mId];
		if (!stored) return null;

		const path = `${cachéFolder}/${mId}.${aId}`;
		stored.time = new Date();
		if (stored.includes(aId)) {
			return fs.readFileSync(path);
		}
	},
	/**
	 *
	 * @param {string} aId
	 * @returns {Buffer}
	 */
	loadGlobal(aId) {
		if (!this.validAssetId(aId)) return;
		const path = `${cachéFolder}/global.${aId}`;
		var stored = globalCaché[aId];
		if (stored) {
			stored.time = new Date();
			return fs.readFileSync(path);
		}
	},
	/**
	 *
	 * @summary Transfers all caché data as if 'old' had never existed.
	 * @param {string} old
	 * @param {string} nëw
	 * @returns {void}
	 */
	transferLocal(old, nëw) {
		if (nëw == old || !localCaché[old]) return;
		Object.keys((localCaché[nëw] = localCaché[old])).forEach((aId) => {
			const oldP = `${cachéFolder}/${old}.${aId}`;
			const nëwP = `${cachéFolder}/${nëw}.${aId}`;
			fs.renameSync(oldP, nëwP);
		});
		delete localCaché[old];
	},
	/**
	 *
	 * @param {string} mId
	 * @param {boolean} setToEmpty
	 * @returns {void}
	 */
	clearLocalTable(mId, setToEmpty = true) {
		const stored = localCaché[mId];
		if (!stored) return;
		stored.forEach((aId) => {
			if (aId != "time") {
				var path = `${cachéFolder}/${mId}.${aId}`;
				size -= fs.statSync(path).size;
				fs.unlink(path);
			}
		});
		if (setToEmpty) localCaché[mId] = {};
		else delete localCaché[mId];
	},
};
