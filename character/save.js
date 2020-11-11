const loadPost = require("../misc/post_body");
const character = require("./main");
const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method == "POST")
		switch (url.pathname) {
			case "/goapi/saveCCCharacter/":
				loadPost(req, res).then(([data]) =>
					character
						.save(Buffer.from(data.body))
						.then((id) => {
							var thumb = Buffer.from(data.thumbdata, "base64");
							character.saveThumb(thumb, id);
							res.end(`0${id}`);
						})
						.catch(() => res.end(`10`))
				);
				return true;

			case "/goapi/saveCCThumbs/":
				loadPost(req, res).then(([data]) => {
					var id = data.assetId;
					var thumb = Buffer.from(data.thumbdata, "base64");
					character.saveThumb(thumb, id);
					res.end(`0${id}`);
				});
				return true;
		}
	return;
};
