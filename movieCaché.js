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

		if (id.toLowerCase().startsWith('e-')) {
			var v = fs.readFileSync(`examples/${id.substr(2)}.zip`);
			if (v[0] != 80) v = v.subarray(1);
			return Promise.resolve(v);
		}
		else if (Number.parseInt(id)) {
			const zip = nodezip.create();
			const filePath = fUtil.getFileIndex('movie-', '.xml', id);
			if (!fs.existsSync(filePath)) return Promise.reject();
			return parseMovie(zip, fs.readFileSync(filePath));
		}
	},
	saveXmlStream(stream, id) {
		return new Promise(res => {
			var ws = fs.createWriteStream(id ?
				fUtil.getFileIndex('movie-', '.xml', id, 7) :
				fUtil.getNextFile('movie-', '.xml', 7));
			var data = '';

			stream.on('data', b => {
				ws.write(b);
				data += b;
			});
			stream.on('end', () => {
				data.substr(0, data.length - 7);
				const t = caché[id];

				var finalData = '';
				for (const name in t)
					if (data.includes(`"${name}"`))
						finalData += `<asset name="${name}">${t[name]}</asset>`;
					else
						delete t[name];
				finalData += `</film>`;
				delete data;

				ws.write(finalData, () => {
					ws.close();
					res(finalData);
				});
			});
		});
	},
	save(buffer, id) {
		const zip = nodezip.unzip(buffer);
		saveXmlStream(zip['movie.xml'].toReadStream(), id);
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