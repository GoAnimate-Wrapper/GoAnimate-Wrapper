const xNumWidth = process.env.XML_NUM_WIDTH;
const baseUrl = process.env.CHAR_BASE_URL;
const xmlH = process.env.XML_HEADER;
const fXml = process.env.FAILURE_XML;
const fw = process.env.FILE_WIDTH;
const fs = require('fs');
const get = require('./reqGet');
const fUtil = require('./fileUtil');
/**
 * 
 * @param {number} id 
 * @returns {Promise<string>}
 */
module.exports = function (id) {
	return new Promise((res, rej) => {
		const nId = Number.parseInt(id);
		if (isNaN(nId))
			fs.readFile(fUtil.getFileIndex('char-', '.xml', id),
				{ encoding: "utf-8" }, (e, s) => e ? rej(e) : res(s));
		else {
			const xmlSubId = nId % fw, fileId = nId - xmlSubId;
			const lnNum = fUtil.padZero(xmlSubId, xNumWidth);
			const url = `${baseUrl}/${fUtil.padZero(fileId)}.txt`;

			get(url).then(b => {
				var line = b.toString('utf8').split('\n').
					find(v => v.substr(0, xNumWidth) == lnNum);
				line ? res(xmlH + line.substr(xNumWidth)) : rej(fXml);
			}).catch(e => rej(fXml));
		}
	});
}