const loadPost = require("../misc/post_body");
const folder = process.env.PREMADE_FOLDER;
const fs = require("fs");
const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/getCCPreMadeCharacters") return;
	loadPost(req, res).then(([data]) => {
		res.setHeader("Content-Type", "text/html; charset=UTF-8");
		const p = `${folder}/${data.themeId}.xml`;
		fs.createReadStream(p).pipe(res);
	});
	return true;
};
