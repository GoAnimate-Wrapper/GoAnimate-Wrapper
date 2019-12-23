const loadPost = require('./loadPostBody');
const asset = require('./callAsset');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getAsset/') return;
	loadPost(req, res).then(data =>
		res.end(asset.load(data.movieId || data.presaveId,
			data.assetId.split('.')[0])));
	return true;
}