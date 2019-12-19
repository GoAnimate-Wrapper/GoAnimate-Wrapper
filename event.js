module.exports = function (req, res, url) {
	if (!url.path.startsWith('/events/')) return;
	return true;
}