const fUtil = require('./fileUtil')
const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || !url.path.startsWith('/goapi/getMovie')) return;
	fs.readFileSync(fUtil.getFileIndex('movie', '.zip', url.query.movieId));
	return true;
}