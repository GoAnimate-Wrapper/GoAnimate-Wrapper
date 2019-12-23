const char = require('./callCharacter');
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
		const i = id.indexOf('-');
		const prefix = id.substr(0, i);
		const suffix = id.substr(i + 1);
		switch (prefix) {
			case 'e':
				const data = fs.readFileSync(`examples/${suffix}.zip`);
				if (data[0] != 80) data = data.subarray(1);
				return Promise.resolve(data);
			case 'm':
				const zip = nodezip.create();
				const filePath = fUtil.getFileIndex('movie-', '.xml', suffix);
				if (!fs.existsSync(filePath)) return Promise.reject();
				return parseMovie(zip, fs.readFileSync(filePath));
		}
	},
	saveXmlStream(stream, id) {
		return new Promise(res => {
			var writeStream, data = '';
			if (id) {
				let i = id.indexOf('-'), prefix = id.substr(0, i), suffix = id.substr(i + 1);
				switch (prefix) {
					case 'e': id = `${prefix = 'm'}-${suffix = fUtil.getNextFileId('movie-', '.xml')}`;
					case 'm': writeStream = fs.createWriteStream(fUtil.getFileIndex('movie-', '.xml', suffix, 7));
				}
			} else
				writeStream = fs.createWriteStream(fUtil.
					getNextFile('movie-', '.xml', 7));

			stream.on('data', b => {
				writeStream.write(b);
				data += b;
			});
			stream.on('end', () => {
				var finalData = '', t = caché[id];
				data.substr(0, data.length - 7);

				for (const name in t)
					if (data.includes(`"${name}"`))
						finalData += `<asset name="${name}">${t[name]}</asset>`;
					else
						delete t[name];
				finalData += `</film>`;
				delete data;

				writeStream.write(finalData, () => {
					writeStream.close();
					res(id);
				});
			});
		});
	},
	async save(id, buffer) {
		const zip = nodezip.unzip(buffer);
		return await this.saveXmlStream(zip['movie.xml'].toReadStream(), id);
	},
	saveAsset(movieId, buffer) {
		const id = generateId();
		if (!caché[movieId])
			caché[movieId] = {};
		var t = caché[movieId];
		t[id] = buffer;
		return id;
	},
	loadAsset(movieId, assetId) {
		return caché[movieId][assetId];
	}
}