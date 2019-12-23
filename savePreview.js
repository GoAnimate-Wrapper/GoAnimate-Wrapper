const fs = require('fs');
const preview = require('./callPreview');
module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/savePreview/') return;
	const id = req.headers.movieid || req.headers.presaveid;
	req.on('end', () => res.end());
	preview.saveStream(req, id);
	return true;
}