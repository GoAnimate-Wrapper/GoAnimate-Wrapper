const caché = require('./movieCaché');
const fUtil = require('./fileUtil');
const base = Buffer.alloc(1, 0);
const fs = require('fs');

module.exports = function (req, res, url) {
	if (!url.path.startsWith('/goapi/getMovie/')) return;
	res.setHeader('Content-Type', 'application/zip');

	caché.load(url.query.movieId).then(b => {
		if (req.method == 'POST')
			b = Buffer.concat([base, b]);
		res.end(b);
	});
	return true;
}