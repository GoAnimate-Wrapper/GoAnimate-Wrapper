const loadPost = require('../request/post_body');
const header = process.env.XML_HEADER;
const nodezip = require('node-zip');
const base = Buffer.alloc(1, 0);
const fUtil = require('../fileUtil');
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
				var chars = '';
				xmlString = `${header}<ugc more="0">${chars}</ugc>`;
				break;
			}
			case 'bg': {
				xmlString = `${header}<ugc more="0"><bg id="666.jpg"/></ugc>`;
				break;
			}
			case 'prop':
			default: {
				xmlString = `${header}<ugc more="0"><prop id="666"/></ugc>`;
				break;
			}
		};

		if (makeZip) {
			const zip = nodezip.create();
			fUtil.addToZip(zip, 'desc.xml', Buffer.from(xmlString));

			switch (data.type) {
				case 'bg': {
					fUtil.addToZip(zip, 'bg/666.jpg', fs.readFileSync(`file:http://2.bp.blogspot.com/-hegG5mMd9kE/T9Y4CWZ6udI/AAAAAAAAA2I/nm-9Wlrh6a4/s1600/full-hd-wallpapers-1080p-1.jpg`));
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