const nodezip = require('node-zip');
const fs = require('fs');

module.exports = function (fileName, zipName) {
	if (!fs.existsSync(fileName)) return Promise.reject();
	const buffer = fs.readFileSync(fileName);
	const zip = nodezip.create();
	zip.add(zipName, buffer);
	if (zip[zipName].crc32 < 0) zip[zipName].crc32 += 4294967296;
	return zip.zip();
}