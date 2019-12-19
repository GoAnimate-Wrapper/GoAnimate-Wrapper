const loadPost = require('./loadPostBody');
const retrieve = require('./numberedChars');

module.exports = function (req, res) {
	switch (req.method) {
		case 'GET':
			const match = req.url.match(/\/characters\/(.+)/);
			if (!match) return;

			var id = match[1];
			res.setHeader('Content-Type', 'text/xml');
			retrieve(id).then(v => { res.statusCode = 200, res.end(v) })
				.catch(e => { res.statusCode = 404, res.end(e) })
			return true;

		case 'POST':
			if (req.url != '/goapi/getCcCharCompositionXml/' || req.method != 'POST') return;
			loadPost(req, res).then(async data => {
				res.setHeader('Content-Type', 'text/html; charset=UTF-8');
				retrieve(data.assetId || data.original_asset_id)
					.then(v => { res.statusCode = 200, res.end(0 + v) })
					//.catch(e => { res.statusCode = 404, res.end(1 + e) })

					// Character not found?  Why not load my archnemesis instead?
					.catch(() => retrieve(306687427).then(v => { res.statusCode = 200, res.end(0 + v) }))
			});
			return true;
		default: return;
	}
}