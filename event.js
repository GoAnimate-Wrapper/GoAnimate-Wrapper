module.exports = function (req, res, url) {
	if (req.method != '' || url.path != '') return;
	return true;
}