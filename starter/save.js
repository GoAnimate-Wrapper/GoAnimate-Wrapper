const loadPost = require("../misc/post_body");
const starter = require("./main");
const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || (url.path != "/goapi/saveTemplate/")) return;
	loadPost(req, res).then(([data, mId]) => {
		const trigAutosave = data.is_triggered_by_autosave;
		if (trigAutosave && (!data.starterId || data.noAutosave)) return res.end("0");

		var body = Buffer.from(data.body_zip, "base64");
		var thumb = data.thumbnail_large && Buffer.from(data.thumbnail_large, "base64");
		starter.save(body, thumb, mId, data.presaveId).then((nId) => res.end("0" + nId));
	});
	return true;
};
