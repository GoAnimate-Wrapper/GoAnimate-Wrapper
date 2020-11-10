const movie = require("./main");
const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "GET" || !url.pathname.startsWith("/meta")) return;
	movie
		.meta(url.path.substr(url.path.lastIndexOf("/") + 1))
		.then((v) => res.end(JSON.stringify(v)))
		.catch(() => {
			res.statusCode = 404;
			res.end();
		});
	return true;
};
