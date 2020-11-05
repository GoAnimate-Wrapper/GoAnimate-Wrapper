const sessions = require("./data/sessions");
const http = require("http");
const start = "/events/";

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {string} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (!url.pathname.startsWith(start)) return;
	switch (url.pathname.substr(start.length)) {
		case "close": {
			sessions.remove(req);
			break;
		}
		default: {
			res.end();
			return false;
		}
	}
	res.end();
	return true;
};
