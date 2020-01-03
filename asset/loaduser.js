const loadPost = require('../loadPostBody');
const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getUserAssetsXml/') return;
	loadPost(req, res).then(data => {
		res.setHeader('Content-Type', 'text/xml');
		switch (data.type) {
			case 'char':
				var chars = '';
				res.end(`<?xml version="1.0" encoding="UTF-8"?><ugc more="0">${chars}</ugc>`);
			case 'prop':
			default:
				res.end(`<?xml version="1.0" encoding="UTF-8"?><ugc more="0"></ugc>`);
		}
	})
	return true;
}