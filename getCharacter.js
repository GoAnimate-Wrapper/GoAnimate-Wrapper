const env = process.env;
const fNumWidth = env.FILE_NUM_WIDTH;
const xNumWidth = env.XML_NUM_WIDTH;
const crossdomain = env.CROSSDOMAIN;
const port = env.SERVER_PORT;
const sXml = env.SUCCESS_XML;
const fXml = env.FAILURE_XML;
const baseUrl = env.CHAR_BASE_URL;
const fw = env.FILE_WIDTH;
const fUtil = require('./fileUtil');
const request = require('./request');
const qs = require('querystring');

/**
 * 
 * @param {number} id 
 */
function retrieve(id) {
	return new Promise((res, rej) => {
		const xmlSubId = id % fw, fileId = id - xmlSubId;
		const lnNum = fUtil.padZero(xmlSubId, xNumWidth);
		const url = baseUrl + fUtil.padZero(fileId) + '.txt';
		request(url).then(b => {
			var line = b.split('\n').find(v => v.substr(0, xNumWidth) == lnNum);
			line ? res(fUtil.fillTemplate(sXml, line.substr(xNumWidth))) : rej(fXml);
		}).catch(e => rej(fXml));
	});
}

module.exports.srvr_goAPI = async function (req, res) {
	if (req.url != '/getCcCharCompositionXml/' || req.method != 'POST') return;

	var data = '';
	req.on('data', v => {
		data += v;
		if (data.length > 1e6) {
			data = '';
			response.writeHead(413, { 'Content-Type': 'text/plain' }).end();
			req.connection.destroy();
		}
	});

	req.on('end', async () => {
		res.setHeader('Content-Type', 'text/html; charset=UTF-8');
		try {
			const v = await retrieve(qs.parse(data).original_asset_id);
			res.statusCode = 200, res.end(0 + v);
		}
		catch (e) {
			res.statusCode = 404, res.end(1 + e);
		}
	});
}

module.exports.srvr_get = async function (req, res) {
	if (req.method != 'GET') return;
	const match = req.url.match(/\/characters\/([0-9]{7,9})/);
	if (!match) return;

	var id = match[1] - 0;
	res.setHeader('Content-Type', 'text/xml');
	try {
		const v = await retrieve(id);
		res.statusCode = 200, res.end(v);
	}
	catch (e) {
		res.statusCode = 404, res.end(e);
	}
}