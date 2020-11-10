const loadPost = require("../misc/post_body");
const sessions = require("../data/sessions");
const formidable = require("formidable");
const asset = require("./main");
const http = require("http");
const fs = require("fs");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST") return;
	switch (url.pathname) {
		case "/upload_asset":
			formidable().parse(req, (_, fields, files) => {
				var [mode, ext] = fields.params.split(".");
				switch (mode) {
					case "vo":
						mode = "voiceover";
						break;
					case "se":
						mode = "soundeffect";
						break;
					case "mu":
						mode = "music";
						break;
				}

				var path = files.import.path;
				var buffer = fs.readFileSync(path);
				var mId = sessions.get(req).movieId;
				asset.save(buffer, mId, mode, ext);
				fs.unlinkSync(path);
				delete buffer;
				res.end();
			});
			return true;
		case "/goapi/saveSound/":
			loadPost(req, res).then(([data, mId]) => {
				var bytes = Buffer.from(data.bytes, "base64");
				asset.save(bytes, mId, "voiceover", "ogg");
			});
			return true;
	}
};
