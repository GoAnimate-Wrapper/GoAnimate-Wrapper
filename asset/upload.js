const formidable = require("formidable");
const sessions = require("../data/sessions");
const asset = require("./main");
const http = require("http");
const fs = require("fs");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {string} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "POST" || url.path != "/upload_asset") return;
	formidable().parse(req, (_, fields, files) => {
		var [mode, ext] = fields.params.split(".");
		var path = files.import.path;
		var buffer = fs.readFileSync(path);
		var mId = sessions.get(req).movieId;
		asset.save(buffer, mId, mode, ext);
		fs.unlinkSync(path);
		delete buffer;
		res.end();
	});
	return true;
};
