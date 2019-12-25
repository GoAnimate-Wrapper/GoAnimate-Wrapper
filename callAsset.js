const caché = require('./movieCaché');

module.exports = {
	load(mId, aId) {
		const nId = caché.getNumId(mId);
		return caché.loadAsset(nId, aId);
	},
	save(mId, buffer, meta) {
		const nId = caché.getNumId(mId);
		return caché.saveAsset(buffer, nId, meta);
	},
};