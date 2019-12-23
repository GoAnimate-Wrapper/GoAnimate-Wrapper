const caché = require('./movieCaché');

module.exports = {
	load: caché.loadAsset,
	save: caché.saveAsset,
};