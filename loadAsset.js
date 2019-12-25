const loadPost = require('./loadPostBody');
const asset = require('./callAsset');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || (url.path != '/goapi/getAsset/' && url.path != '/goapi/getAssetEx/')) return;
	loadPost(req, res).then(data => res.end(asset.load(data.movieId || data.presaveId, (data.assetId || data.enc_asset_id).split('.')[0]).buffer));
	return true;
}