const movie = require("./main");
const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {string} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "GET" || url.path != "/movieList") return;
	Promise.all(movie.list().map(movie.meta)).then((a) => res.end(JSON.stringify(a)));
	return true;
};
