const nodezip = require('node-zip');
const fUtil = require('./fileUtil');
const fs = require('fs');
var cache = {}, filePath;

module.exports = {
	load(path) {
		if (!fs.existsSync(path))
			return Promise.reject();
		cache = {}, filePath = path;
		const zip = nodezip.create();
		fUtil.addToZip(zip, 'movie.xml',
			fs.readFileSync(path));
		fUtil.addToZip(zip, 'themelist.xml',
			new Buffer(`<?xml version="1.0" encoding="utf-8"?><themes><theme>business</theme><theme>common</theme></themes>`));
		fUtil.addToZip(zip, 'common.xml',
			fs.readFileSync('themes/common.xml'));
		fUtil.addToZip(zip, 'business.xml',
			fs.readFileSync('themes/business.xml'));
		return zip.zip();
	},
	save(path, buffer) {
		return new Promise(res => {
			const zip = nodezip.unzip(buffer);

			var data = '';
			if (path != filePath)
				cache = {}, filePath = path;

			const stream = zip['movie.xml'].toReadStream();
			stream.on('data', b => data += b);
			stream.on('end', () => {
				var finalData = data.substr(0, data.length - 7);
				var count = 0; for (var i in zip.entries()) count++;
				if (count > 1)
					for (var i in zip.entries()) {
						var e = zip[i];
						if (!e || e.name == 'movie.xml') {
							count--; continue;
						}
						const chunks = [], str = e.toReadStream();
						str.on('data', b => chunks.push(b));
						str.on('end', () => {
							finalData += `< asset name = "${e.name}" > ${Buffer.concat(chunks)}</asset > `;
							if (!--count) fs.writeFile(path, finalData += `</film > `, res);
						});
					}
				else
					fs.writeFile(path, finalData += `</film > `, res);
			});
		});
	},
	addFile(buffer) {

	},
	getFile(path) {

	}
}