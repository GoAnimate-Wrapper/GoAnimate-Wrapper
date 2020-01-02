const caché = require('../movie/caché');

module.exports = {
	load(mId, aId) {
		const nId = caché.getNumId(mId);
		return caché.loadAsset(nId, aId);
	},
	save(buffer, mId, ext) {
		const nId = caché.getNumId(mId);
		return caché.saveAsset(buffer, nId, ext);
	},
};