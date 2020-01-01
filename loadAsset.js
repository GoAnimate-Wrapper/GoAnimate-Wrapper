const loadPost = require('./loadPostBody');
const asset = require('./callAsset');

module.exports = function (req, res, url) {
	switch (req.method) {
		case 'GET':
			const match = req.url.match(/\/assets\/([^/]+)\/([^.]+)(?:\.xml)?$/);
			if (!match) return;

			var mId = match[1], aId = match[2];
			asset.load(mId, aId).then(v => { res.statusCode = 200, res.end(v) })
				.catch(e => { res.statusCode = 404, res.end(e) })
			return true;

		case 'POST':
			if (url.path != '/goapi/getAsset/' && url.path != '/goapi/getAssetEx/') return;
			loadPost(req, res).then(data => {
				const mId = data.movieId || data.presaveId, aId = data.assetId || data.enc_asset_id;
				asset.load(mId, aId).then(v => res.end(v)).catch(() => { res.statusCode = 404, res.end(); })
			});
			return true;
	}
}