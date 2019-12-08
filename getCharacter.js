const env = process.env;
const fNumWidth = env.FILE_NUM_WIDTH;
const xNumWidth = env.XML_NUM_WIDTH;
const crossdomain = env.CROSSDOMAIN;
const port = env.SERVER_PORT;
const sXml = env.SUCCESS_XML;
const fXml = env.FAILURE_XML;
const baseUrl = env.CHAR_BASE_URL;
const fw = env.FILE_WIDTH;
const fs = require('fs');
const fUtil = require('./fileUtil');
const request = require('./reqGet');
const loadPost = require('./loadPostBody');

/**
 * 
 * @param {number} id 
 */
function retrieve(id) {
	return new Promise((res, rej) => {
		const nId = Number.parseInt(id);
		if (isNaN(nId))
			fs.readFile(`./files/${id}.xml`, { encoding: "utf-8" }, (e, s) => e ? rej(e) : res(s));
		else {
			const xmlSubId = nId % fw, fileId = nId - xmlSubId;
			const lnNum = fUtil.padZero(xmlSubId, xNumWidth);
			const url = `${baseUrl}/${fUtil.padZero(fileId)}.txt`;
			request(url).then(b => {
				var line = b.split('\n').find(v => v.substr(0, xNumWidth) == lnNum);
				line ? res(fUtil.fillTemplate(sXml, line.substr(xNumWidth))) : rej(fXml);
			}).catch(e => rej(fXml));
		}
	});
}

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
				retrieve(data.original_asset_id)
					.then(v => { res.statusCode = 200, res.end(0 + v) })
					.catch(e => { res.statusCode = 404, res.end(1 + e) })
			});
			return true;
		default: return;
	}
}