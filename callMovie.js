const caché = require('./movieCaché');
const fUtil = require('./fileUtil');
const fs = require('fs');
module.exports = {
	async save(movieZip, thumbZip, movieId) {
		const nId = caché.getNumId(movieId);
		const thumbFile = fUtil.getFileIndex('thumb-', '.png', nId);
		thumbZip && fs.writeFileSync(thumbFile, thumbZip);
		await caché.saveMovie(movieZip, nId);
		return nId;
	},
	load(movieId) {
		return caché.loadMovieFromStr(movieId);
	},
}