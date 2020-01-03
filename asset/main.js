const caché = require('../movie/caché');

module.exports = {
	load(mId, aId) {
		return caché.loadAsset(mId, aId);
	},
	save(buffer, mId, ext) {
		return caché.saveAsset(buffer, mId, ext);
	},
};