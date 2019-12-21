const loadPost = require('./loadPostBody');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getUserAssetsXml/') return;
	loadPost(req, res).then(data => {
		res.setHeader('Content-Type', 'text/xml');
		switch (data.type) {
			case 'prop':
				res.end(`<?xml version="1.0" encoding="UTF-8"?><ugc more="0"></ugc>`);
			case 'char':
				res.end(`<?xml version="1.0" encoding="UTF-8"?><ugc more="0"><char id="323969864" enc_asset_id="0fNXkk78CidtqxVOBTmUCag" name="Untitled" cc_theme_id="business" thumbnail_url="char_default.png" copyable="Y"><tags/></char><char id="323952145" enc_asset_id="0WJcGH2Ofon3GbLd1u6tbAw" name="Untitled" cc_theme_id="business" thumbnail_url="char_default.png" copyable="Y"><tags/></char><char id="323952089" enc_asset_id="0QQAd5oM0b2MiuQ0JDOFAuw" name="Untitled" cc_theme_id="business" thumbnail_url="char_default.png" copyable="Y"><tags/></char><char id="323951633" enc_asset_id="0LFFFQdN65unTEEJSpuZAGA" name="Untitled" cc_theme_id="business" thumbnail_url="char_default.png" copyable="Y"><tags/></char></ugc>`);
		}
	})
	return true;
}