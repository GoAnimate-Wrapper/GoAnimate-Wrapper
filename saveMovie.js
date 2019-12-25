const loadPost = require('./loadPostBody');
const callMovie = require('./callMovie');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/saveMovie/') return;
	loadPost(req, res).then(data => {
		var id = data.movieId || data.presaveId;
		var body = Buffer.from(data.body_zip, 'base64');
		var thumb = Buffer.from(data.thumbnail_large, 'base64');
		callMovie.save(body, thumb, id).then(() => res.end('0' + id));
	});
	return true;
}