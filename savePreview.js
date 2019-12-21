const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/savePreview/') return;
	const id = req.headers.movieid || req.headers.presaveid;
	const fn = `previewCaché/${id.padStart(7, '0')}.xml`;

	req.pipe(fs.createWriteStream(fn));
	req.on('end', () => res.end());
	return true;
}