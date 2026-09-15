const path = require("path");
const fs = require("fs");
const http = require("http");

const ruffleRoot = path.join(__dirname, "..", "node_modules", "@ruffle-rs", "ruffle");

const mimeTypes = {
	".js": "application/javascript",
	".wasm": "application/wasm",
	".map": "application/json",
	".json": "application/json",
};

/**
 * Serves the self-hosted Ruffle (Flash emulator) build out of node_modules so the
 * character creator / editor / player SWFs can run in browsers without a Flash
 * plugin (including mobile browsers with touch input), fully offline once installed.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "GET" || !url.pathname.startsWith("/ruffle/")) return;

	const rel = path.normalize(decodeURIComponent(url.pathname.substring("/ruffle/".length)));
	if (rel.startsWith("..") || path.isAbsolute(rel)) {
		res.statusCode = 400;
		res.end();
		return true;
	}

	const filePath = path.join(ruffleRoot, rel);
	if (!filePath.startsWith(ruffleRoot) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
		res.statusCode = 404;
		res.end();
		return true;
	}

	res.setHeader("Content-Type", mimeTypes[path.extname(filePath)] || "application/octet-stream");
	fs.createReadStream(filePath).pipe(res);
	return true;
};
