const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "GET" || !url.pathname.startsWith("/go/character_creator")) return;
	[url, theme, mode, id] = matches = /\/go\/character_creator\/(\w+)\/(\w+)\/(.+)$/.exec(url.pathname);
	switch (mode) {
		case "copy":
			res.setHeader("Location", `/cc?themeId=${theme}&original_asset_id=${id}`);
			res.statusCode = 302;
			res.end();
			break;
	}
};
