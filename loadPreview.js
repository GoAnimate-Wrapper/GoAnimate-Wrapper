const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'GET' || url.pathname != '/loadPreview') return;
	const id = url.query.movieId || url.query.presaveId;
	const fn = `previewCaché/${id.padStart(7, '0')}.xml`;
	const stream = fs.createReadStream(fn);
	stream.on('end', () => fs.unlinkSync(fn));
	stream.pipe(res);
	return true;
}