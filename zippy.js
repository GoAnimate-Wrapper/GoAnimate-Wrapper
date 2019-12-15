const nodezip = require('node-zip');
const fs = require('fs');

module.exports = function (fileName, zipName) {
	const buffer = fs.readFileSync(fileName);
	const zip = nodezip.create();
	zip.add(zipName, buffer);
	zip[zipName].crc32 = 666;
	return zip.zip();
}