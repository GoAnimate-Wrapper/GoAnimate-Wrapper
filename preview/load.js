const preview = require('./main');
module.exports = function (req, res, url) {
	if (req.method != 'GET' || url.pathname != '/loadPreview') return;
	const id = url.query.movieId || url.query.presaveId;
	const stream = preview.loadStream(id);
	stream.pipe(res);
	return true;
}