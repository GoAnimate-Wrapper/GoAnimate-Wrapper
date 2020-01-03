const preview = require('./main');
module.exports = function (req, res, url) {
	if (req.method != 'GET' || url.pathname != '/loadPreview') return;
	const ip = req.headers['x-forwarded-for'];
	const stream = preview.pop(ip);
	stream.pipe(res);
	return true;
}