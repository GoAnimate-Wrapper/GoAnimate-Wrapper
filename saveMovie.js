const loadPost = require('./loadPostBody');
const caché = require('./movieCaché');
const fUtil = require('./fileUtil');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/saveMovie/') return;
	loadPost(req, res).then(data => {
		const body = Buffer.from(data.body_zip, 'base64');
		caché.save(data.movieId, body).then(() => res.end('0' + id));
	});
	return true;
}