const char = require('./numberedChars');
const source = process.env.CLIENT_URL;
const nodezip = require('node-zip');
const fUtil = require('./fileUtil');
const xmldoc = require('xmldoc');
const fs = require('fs');
var caché = {};

function generateId() {
	var id;
	do id = ('' + Math.random()).replace('.', '');
	while (caché[id]);
	return id;
}

async function parseMovie(zip, buffer) {
	const chars = {}, themes = { common: true };
	fUtil.addToZip(zip, 'movie.xml', buffer);
	const xml = new xmldoc.XmlDocument(buffer);
	var scenes = xml.childrenNamed('scene');

	for (const sK in scenes) {
		var scene = scenes[sK];
		for (const pK in scene.children) {
			var piece = scene.children[pK];

			switch (piece.name) {
				case 'durationSetting':
				case 'trans':
					continue;

				case 'bg':
				case 'prop':
					/** @type [string] */
					var v = piece.childNamed('file').val.split('.');
					v.splice(1, 0, piece.name);
					var name = v.join('.');
					themes[v[0]] = true;
					break;

				case 'char':
					var v = piece.childNamed('action').val.split('.');
					var id = Number.parseInt(v[1]);
					v.splice(1, 0, piece.name);
					chars[id] = true;
					if (v[0] != 'ugc')
						themes[v[0]] = true;

					switch (v[v.length - 1]) {
						case 'xml':
							var c = await char(id), n = `${v[0]}.${v[2]}.xml`;
							fUtil.addToZip(zip, n, Buffer.from(c));
							break;
					};
					break;
			};
		}
	}
	const themeKs = Object.keys(themes);
	themeKs.forEach(t => fUtil.addToZip(zip, `${t}.xml`, fs.readFileSync(`themes/${t}.xml`)));
	fUtil.addToZip(zip, 'themelist.xml', Buffer.from(`<?xml version="1.0" encoding="utf-8"?><themes>${
		themeKs.map(t => `<theme>${t}</theme>`).join('')}</themes>`));

	return await zip.zip();
}

module.exports = {
	load(id) {
		caché[id] = {};
		const zip = nodezip.create();
		filePath = fUtil.getFileIndex('movie-', '.xml', id)
		if (!fs.existsSync(filePath)) return Promise.reject();
		return parseMovie(zip, fs.readFileSync(filePath));
	},
	save(buffer, id) {
		var path = id ?
			fUtil.getFileIndex('movie-', '.xml', id, 7) :
			fUtil.getNextFile('movie-', '.xml', 7);
		return new Promise(res => {
			const zip = nodezip.unzip(buffer);
			var data = ''; delete caché[id];

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
							finalData += `<asset name = "${e.name}" > ${Buffer.concat(chunks)}</asset>`;
							if (!--count) fs.writeFile(path, finalData += `</film> `, res);
						});
					}
				else
					fs.writeFile(path, finalData += `</film > `, res);
			});
		});
	},
	addAsset(movieId, buffer) {
		const id = generateId();
		caché[movieId][id] = buffer;
		return id;
	},
	getAsset(movieId, assetId) {
		return caché[movieId][assetId];
	}
}