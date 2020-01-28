const loadPost = require('../request/post_body');
const get = require('../request/get');
const header = process.env.XML_HEADER;
const fUtil = require('../fileUtil');
const nodezip = require('node-zip');
const base = Buffer.alloc(1, 0);
const asset = require('./main');
const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST') return;

	var makeZip = false; switch (url.path) {
		case '/goapi/getUserAssets/': makeZip = true; break;
		case '/goapi/getUserAssetsXml/': break;
		default: return;
	}

	loadPost(req, res).then(async data => {
		var xmlString;
		switch (data.type) {
			case 'char': {
				const chars = await asset.chars(data.themeId);
				xmlString = `${header}<ugc more="0">${chars.map(v => `<char id="${v.id}" name="Untitled" cc_theme_id="${
					v.theme}" thumbnail_url="char_default.png" copyable="Y"><tags/></char>`).join('')}</ugc>`;
				break;
			}
			case 'bg': {
				xmlString = `${header}<ugc more="0"><bg id="666.jpg"/></ugc>`;
				break;
			}
			case 'prop':
			default: {
				xmlString = `${header}<ugc more="0"></ugc>`;
				break;
			}
		};

		if (makeZip) {
			const zip = nodezip.create();
			fUtil.addToZip(zip, 'desc.xml', Buffer.from(xmlString));

			switch (data.type) {
				case 'bg': {
					fUtil.addToZip(zip, 'bg/666.jpg', await get(`https://2.bp.blogspot.com/-hegG5mMd9kE/T9Y4CWZ6udI/AAAAAAAAA2I/nm-9Wlrh6a4/s1600/full-hd-wallpapers-1080p-1.jpg`));
					break;
				}
			};
			res.setHeader('Content-Type', 'application/zip');
			res.end(Buffer.concat([base, await zip.zip()]));
		}
		else {
			res.setHeader('Content-Type', 'text/xml');
			res.end(xmlString);
		}
	})
	return true;
}