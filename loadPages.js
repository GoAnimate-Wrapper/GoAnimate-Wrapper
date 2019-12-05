function jsonToQueryString(json) {
	return Object.keys(json).map(key =>
		encodeURIComponent(key) + '=' +
		encodeURIComponent(json[key])
	).join('&');
}

module.exports = function (req, res, parsedUrl) {
	if (req.method != 'GET') return;
	const params = parsedUrl.query;

	var resString;
	switch (parsedUrl.pathname) {
		case '/cc_char':
			const char = params['char'], theme = params['theme'], id = params['id'];

			const flashvars = {
				"apiserver": "http:\/\/localhost\/", "storePath": "https:\/\/d3v4eglovri8yt.cloudfront.net\/store\/3a981f5cb2739137\/<store>",
				"clientThemePath": "http://localhost/<client_theme>", "appCode": "go", "page": "", "siteId": "go", "userId": "00EDZP3Cu0aw",
				"m_mode": "school", "bs": char, "isLogin": "Y", "isEmbed": "0", "ctc": "go", "tlang": "en_US", "themeId": theme || 'business', "ut": 30, "original_asset_id": id
			};
			resString = process.env.CC_HTML.replace('%s', jsonToQueryString(flashvars));
			break;
		case '/studio':
			break;
		default:
			return;
	}
	res.setHeader('Content-Type', 'text/html; charset=UTF-8');
	res.end(resString);
}