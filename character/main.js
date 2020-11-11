const cachéFolder = process.env.CACHÉ_FOLDER;
const xNumWidth = process.env.XML_NUM_WIDTH;
const baseUrl = process.env.CHAR_BASE_URL;
const fUtil = require("../misc/file");
const util = require("../misc/util");
const get = require("../misc/get");
const fw = process.env.FILE_WIDTH;
const fs = require("fs");
const themes = {};

function addTheme(id, buffer) {
	const beg = buffer.indexOf(`theme_id="`) + 10;
	const end = buffer.indexOf(`"`, beg);
	const theme = buffer.subarray(beg, end).toString();
	return (themes[id] = theme);
}

function save(id, data) {
	const i = id.indexOf("-");
	const prefix = id.substr(0, i);
	const suffix = id.substr(i + 1);
	fs.writeFileSync(fUtil.getFileIndex("char-", ".xml", suffix), data);
	addTheme(id, data);
	return id;
}

fUtil.getValidFileIndicies("char-", ".xml").map((n) => {
	return addTheme(`c-${n}`, fs.readFileSync(fUtil.getFileIndex("char-", ".xml", n)));
});

module.exports = {
	/**
	 * @param {string} id
	 * @returns {Promise<string>}
	 */
	getTheme(id) {
		return new Promise((res, rej) => {
			if (themes[id]) res(themes[id]);
			this.load(id)
				.then((b) => res(addTheme(id, b)))
				.catch(rej);
		});
	},
	/**
	 * @param {string} id
	 * @returns {Promise<Buffer>}
	 */
	load(id) {
		return new Promise((res, rej) => {
			const i = id.indexOf("-");
			const prefix = id.substr(0, i);
			const suffix = id.substr(i + 1);

			switch (prefix) {
				case "c":
					fs.readFile(fUtil.getFileIndex("char-", ".xml", suffix), (e, b) => {
						if (e) {
							var fXml = util.xmlFail();
							rej(Buffer.from(fXml));
						} else {
							res(b);
						}
					});
					break;

				case "C":
					fs.readFile(fUtil.getFileString("char-", ".xml", suffix), (e, b) => {
						if (e) {
							var fXml = util.xmlFail();
							rej(Buffer.from(fXml));
						} else {
							res(b);
						}
					});
					break;

				case "a":
				case "":
				default: {
					// Blank prefix is left here for backwards-compatibility purposes.
					const nId = Number.parseInt(suffix);
					const xmlSubId = nId % fw,
						fileId = nId - xmlSubId;
					const lnNum = fUtil.padZero(xmlSubId, xNumWidth);
					const url = `${baseUrl}/${fUtil.padZero(fileId)}.txt`;

					get(url)
						.then((b) => {
							var line = b
								.toString("utf8")
								.split("\n")
								.find((v) => v.substr(0, xNumWidth) == lnNum);
							if (line) {
								res(Buffer.from(line.substr(xNumWidth)));
							} else {
								rej(Buffer.from(util.xmlFail()));
							}
						})
						.catch((e) => rej(Buffer.from(util.xmlFail())));
				}
			}
		});
	},
	/**
	 * @param {Buffer} data
	 * @param {string} id
	 * @returns {Promise<string>}
	 */
	save(data, id) {
		return new Promise((res, rej) => {
			if (id) {
				const i = id.indexOf("-");
				const prefix = id.substr(0, i);
				const suffix = id.substr(i + 1);
				switch (prefix) {
					case "c":
						fs.writeFile(fUtil.getFileIndex("char-", ".xml", suffix), data, (e) => (e ? rej() : res(id)));
					case "C":
						fs.writeFile(fUtil.getFileString("char-", ".xml", suffix), data, (e) => (e ? rej() : res(id)));
					default:
						res(save(id, data));
				}
			} else {
				saveId = `c-${fUtil.getNextFileId("char-", ".xml")}`;
				res(save(saveId, data));
			}
		});
	},
	/**
	 * @param {Buffer} data
	 * @param {string} id
	 * @returns {Promise<string>}
	 */
	saveThumb(data, id) {
		return new Promise((res, rej) => {
			var thumb = Buffer.from(data, "base64");
			var path = `${cachéFolder}/char.${id}.png`;
			fs.writeFileSync(path, thumb);
			res(id);
		});
	},
	/**
	 * @param {string} id
	 * @returns {Promise<Buffer>}
	 */
	loadThumb(id) {
		return new Promise((res, rej) => {
			var path = `${cachéFolder}/char.${id}.png`;
			fs.readFile(path, (e, b) => {
				if (e) {
					var fXml = util.xmlFail();
					rej(Buffer.from(fXml));
				} else {
					res(b);
				}
			});
		});
	},
};
