const loadPost = require('./loadPostBody');
const caché = require('./movieCaché');
const nodezip = require('node-zip');

module.exports = function (req, res, url) {
	if (req.method != 'POST') return;
	switch (url.path) {
		case '/goapi/saveMovie/':
			loadPost(req, res).then(data => {
				var id = data.movieId || data.presaveId;
				var body = Buffer.from(data.body_zip, 'base64');
				caché.save(nodezip.unzip(body), id).then(() => res.end('0' + id));
			});
			break;
		case '/goapi/saveMovieXml/':
			var id = req.headers.movieId || req.headers.presaveId;
			caché.saveXmlStream(req, id).then(() => res.end());
			break;
		default:
			return false;
	}
	return true;
}