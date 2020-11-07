const formidable = require("formidable");
const sessions = require("../data/sessions");
const asset = require("./main");
const http = require("http");
const fs = require("fs");

module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/goapi/saveSound/") return;
	loadPost(req, res).then((data) => {
		tts(data.voice, data.text).then((buffer) => {
			mp3Duration(buffer, (e, d) => {
				var dur = d * 1e3;
				if (e || !dur) {
					return res.end(1 + util.xmlFail());
				}

				const title = `[${voices[data.voice].desc}] ${data.text}`;
				const id = asset.save(buffer, data.presaveId, "voiceover", "mp3");
				res.end(
					`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>voiceover</subtype><title>${title}</title><published>0</published><tags></tags><duration>${dur}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`
				);
			});
		});
	});
	return true;
};
