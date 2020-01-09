const fUtil = require('../fileUtil');
const caché = require('./caché');
const fs = require('fs');

module.exports = {
	async save(movieZip, thumbZip, mId, preId = mId) {
		const thumbFile = fUtil.getNextFile('thumb-', 'png');
		thumbZip && fs.writeFileSync(thumbFile, thumbZip);
		await caché.saveMovie(movieZip, preId, mId);
		return mId;
	},
	load(movieId) {
		return caché.loadMovie(movieId);
	},
}