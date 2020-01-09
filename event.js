const start = '/events/';
module.exports = function (req, res, url) {
	if (!url.path.startsWith(start)) return;
	console.log(url.path.substr(start.length));
	return true;
}