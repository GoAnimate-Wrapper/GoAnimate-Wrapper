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
 * @param {string} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/convertTextToSoundAsset/") return;
	loadPost(req, res).then((data) => {
		tts(data.voice, data.text).then((buffer) => {
			mp3Duration(buffer, (e, d) => {
				var dur = d * 1e3;
				if (e || !dur) {
					return res.end(1 + util.xmlFail());
				}

				const title = `[${voices[data.voice].desc}] ${data.text}`;
				const id = asset.save(buffer, data.presaveId, "tts", "mp3");
				res.end(
					`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${title}</title><published>0</published><tags></tags><duration>${dur}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`
				);
			});
		});
	});
	return true;
};
