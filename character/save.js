const loadPost = require("../misc/post_body");
const character = require("./main");
const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {string} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/saveCCCharacter/") return;
	loadPost(req, res)
		.then((data) => character.save(Buffer.from(data.body)))
		.then((e) => (e ? res.end("10") : res.end("00")));
	return true;
};
