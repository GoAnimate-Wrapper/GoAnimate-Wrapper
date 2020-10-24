const thumbUrl = process.env.THUMB_BASE_URL;
const get = require("../misc/get");
const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {string} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "GET" || !url.path.startsWith("/stock_thumbs")) return;
	get(thumbUrl + url.path.substr(url.path.lastIndexOf("/"))).then((v) => res.end(v));
	return true;
};
