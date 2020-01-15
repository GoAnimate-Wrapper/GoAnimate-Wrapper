const preview = require('./main');
module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/save_preview/') return;
	console.log('Adding preview information.');
	const ip = req.headers['x-forwarded-for'];
	req.on('end', () => res.end());
	preview.push(req, ip);
	return true;
}