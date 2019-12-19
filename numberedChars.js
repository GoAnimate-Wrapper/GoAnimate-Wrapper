const env = process.env;
const xNumWidth = env.XML_NUM_WIDTH;
const sXml = env.SUCCESS_XML;
const fXml = env.FAILURE_XML;
const baseUrl = env.CHAR_BASE_URL;
const fw = env.FILE_WIDTH;
const fs = require('fs');
const fUtil = require('./fileUtil');
const request = require('./reqGet');
/**
 * 
 * @param {number} id 
 * @returns {Promise<string>}
 */
module.exports = function (id) {
	return new Promise((res, rej) => {
		const nId = Number.parseInt(id);
		if (isNaN(nId))
			fs.readFile(fUtil.getFileIndex('char-', '.xml', id), { encoding: "utf-8" }, (e, s) => e ? rej(e) : res(s));
		else {
			const xmlSubId = nId % fw, fileId = nId - xmlSubId;
			const lnNum = fUtil.padZero(xmlSubId, xNumWidth);
			const url = `${baseUrl}/${fUtil.padZero(fileId)}.txt`;
			request(url).then(b => {
				var line = b.toString('utf8').split('\n').find(v => v.substr(0, xNumWidth) == lnNum);
				line ? res(fUtil.fillTemplate(sXml, line.substr(xNumWidth))) : rej(fXml);
			}).catch(e => rej(fXml));
		}
	});
}