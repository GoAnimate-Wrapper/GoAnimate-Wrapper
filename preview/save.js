const preview = require('./main');
module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/savePreview/') return;
	console.log('Adding preview information.');
	const id = req.headers.movieid || req.headers.presaveid;
	req.on('end', () => res.end());
	preview.saveStream(req, id);
	return true;
}