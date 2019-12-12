module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getUserAssetsXml') return;

	return true;
}