const movie = require('./callMovie');
const base = Buffer.alloc(1, 0);

module.exports = function (req, res, url) {
	if (!url.path.startsWith('/goapi/getMovie/')) return;
	res.setHeader('Content-Type', 'application/zip');

	movie.load(url.query.movieId).then(b => {
		if (req.method == 'POST')
			b = Buffer.concat([base, b]);
		res.end(b);
	});
	return true;
}