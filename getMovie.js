const caché = require('./movieCaché');
const fUtil = require('./fileUtil');
const base = Buffer.alloc(1, 0);
const fs = require('fs');

function respond(b, res) {
	if (b[0] != 0)
		b = Buffer.concat([base, b]);
	res.end(b);
}

module.exports = function (req, res, url) {
	if (req.method != 'POST' || !url.path.startsWith('/goapi/getMovie')) return;
	const zipF = fUtil.getFileIndex('movie-', '.xml', url.query.movieId);
	res.setHeader('Content-Type', 'application/zip');
	caché.load(zipF).then(b => respond(b, res));
	return true;
}