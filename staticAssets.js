const stuff = require('./staticInfo.json');
const request = require('./reqGet');
const fs = require('fs');

function local(req, res, url) {
	const methodLinks = stuff[req.method];
	for (let linkIndex in methodLinks)
		if (new RegExp(linkIndex).test(url.path)) {
			const t = methodLinks[linkIndex];
			const link = t.link || url.path;
			const headers = t.headers;
			try {
				for (var headerName in headers || {})
					res.setHeader(headerName, headers[headerName]);
				res.statusCode = t.overrideCode || 200;
				if (t.content !== undefined) res.end(t.content);
				else fs.createReadStream('.' + link).pipe(res);
			}
			catch (e) {
				res.statusCode = t.overrideCode || 404, res.end();
			}
			return true;
		}
}

function remote(req, res) {
	if (req.method != 'GET') return;
	const match = req.url.match(/\/.+\.([a-z]{2,3})/);
	if (!match) return;

	const url = process.env.ASSET_BASE_URL + req.url;
	request(url).then(d => {
		if (d.includes('404:')) return;
		switch (match[1]) {
			case 'mo':
				res.setHeader('Content-Type', 'binary/octet-stream');
				break;
			case 'swf':
				console.log(url);
				res.setHeader('Content-Type', 'application/x-shockwave-flash');
				break;
		}
		res.end(d);
	});
	return true;
}

module.exports = function (req, res, url) {
	return local(req, res, url) || remote(req, res, url);
}