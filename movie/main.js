const fUtil = require('../fileUtil');
const caché = require('./caché');
const fs = require('fs');
module.exports = {
	async save(movieZip, thumbZip, mId, preId = mId) {
		const nId = caché.getNumId();
		const thumbFile = fUtil.getFileIndex('thumb-', '.png', nId);
		thumbZip && fs.writeFileSync(thumbFile, thumbZip);
		await caché.saveMovie(movieZip, mId, preId);
		return nId;
	},
	load(movieId) {
		return caché.loadMovie(movieId);
	},
}