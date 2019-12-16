const loadPost = require('./loadPostBody');
const cache = require('./movieCache');
const fUtil = require('./fileUtil');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/saveMovie/') return;
	loadPost(req, res).then(data => {
		var fn, id;
		if (data.movieId)
			fn = fUtil.getFileIndex('movie-', '.xml', data.movieId, 7), id = data.movieId;
		else
			fn = fUtil.getNextFile('movie-', '.xml', 7), id = fn.substr(fn.lastIndexOf('-') + 1, 7);
		const body = Buffer.from(data.body_zip, 'base64');
		cache.save(fn, body).then(() => res.end('0' + id));
	});
	return true;
}