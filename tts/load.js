const loadPost = require("../misc/post_body");
const mp3Duration = require("mp3-duration");
const voices = require("./info").voices;
const asset = require("../asset/main");
const util = require("../misc/util");
const tts = require("./main");
const http = require("http");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/convertTextToSoundAsset/") return;
	loadPost(req, res).then(([data, mId]) => {
		tts(data.voice, data.text)
			.then((buffer) => {
				mp3Duration(buffer, (e, d) => {
					var dur = d * 1e3;
					if (e || !dur) {
						return res.end(1 + util.xmlFail("Unable to retrieve MP3 stream."));
					}

					const title = `[${voices[data.voice].desc}] ${data.text}`;
					const id = asset.save(buffer, mId, "tts", "mp3");
					res.end(
						`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${title}</title><published>0</published><tags></tags><duration>${dur}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`
					);
				});
			})
			.catch((e) => {
				res.end(1 + util.xmlFail(e));
			});
	});
	return true;
};
