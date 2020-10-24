const loadPost = require("../misc/post_body");
const header = process.env.XML_HEADER;
const fUtil = require("../misc/file");
const nodezip = require("node-zip");
const base = Buffer.alloc(1, 0);
const asset = require("./main");
const http = require("http");

async function listAssets(data, makeZip) {
	var xmlString;
	switch (data.type) {
		case "char": {
			const chars = await asset.chars(data.themeId);
			xmlString = `${header}<ugc more="0">${chars
				.map(
					(v) =>
						`<char id="${v.id}" name="Untitled" cc_theme_id="${v.theme}" thumbnail_url="char_default.png" copyable="Y"><tags/></char>`
				)
				.join("")}</ugc>`;
			break;
		}
		case "bg": {
			var files = asset.list(data.movieId, "bg");
			xmlString = `${header}<ugc more="0">${files.map((v) => `<bg id="${v.id}"/>`).join("")}</ugc>`;
			break;
		}
		case "prop":
		default: {
			var files = asset.list(data.movieId, "prop");
			xmlString = `${header}<ugc more="0">${files.map((v) => `<prop id="${v.id}"/>`).join("")}</ugc>`;
			break;
		}
	}

	if (makeZip) {
		const zip = nodezip.create();
		const files = asset.listAll(data.movieId);
		fUtil.addToZip(zip, "desc.xml", Buffer.from(xmlString));

		files.forEach((file) => {
			switch (file.mode) {
				case "bg":
				case "sound":
				case "effect":
				case "prop": {
					const buffer = asset.load(data.movieId, file.id);
					fUtil.addToZip(zip, `${file.mode}/${file.id}`, buffer);
					break;
				}
			}
		});
		return Buffer.concat([base, await zip.zip()]);
	} else {
		return Buffer.from(xmlString);
	}
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {string} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	var makeZip = false;
	switch (url.path) {
		case "/goapi/getUserAssets/":
			makeZip = true;
			break;
		case "/goapi/getUserAssetsXml/":
			break;
		default:
			return;
	}

	switch (req.method) {
		case "GET": {
			listAssets(url.query, makeZip).then((buff) => {
				const type = makeZip ? "application/zip" : "text/xml";
				res.setHeader("Content-Type", type), res.end(buff);
			});
			return true;
		}
		case "POST": {
			loadPost(req, res)
				.then((data) => listAssets(data, makeZip))
				.then((buff) => {
					const type = makeZip ? "application/zip" : "text/xml";
					res.setHeader("Content-Type", type), res.end(buff);
				});
			return true;
		}
		default:
			return;
	}
};
