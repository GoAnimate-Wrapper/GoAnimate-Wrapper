const char = require('./callCharacter');
const source = process.env.CLIENT_URL;
const nodezip = require('node-zip');
const fUtil = require('./fileUtil');
const xmldoc = require('xmldoc');
const fs = require('fs');

/**
 * @typedef {{[nId:number]:{[aId:string]:{meta:{},buffer:Buffer}}}} cachéType
 * @type cachéType
 */
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
	var elements = xml.children;

	for (const eK in elements) {
		var element = elements[eK];
		switch (element.name) {
			case 'scene':
				for (const pK in element.children) {
					var piece = element.children[pK];

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
					}
				}
				break;
			case 'asset':
				caché[element.attr.name] = element.val;
				break;
		}
	}
	const themeKs = Object.keys(themes);
	themeKs.forEach(t => fUtil.addToZip(zip, `${t}.xml`, fs.readFileSync(`themes/${t}.xml`)));
	fUtil.addToZip(zip, 'themelist.xml', Buffer.from(`<?xml version="1.0" encoding="utf-8"?><themes>${
		themeKs.map(t => `<theme>${t}</theme>`).join('')}</themes>`));

	return await zip.zip();
}

module.exports = {
	loadMovieFromStr(id) {
		caché[id] = {};
		const i = id.indexOf('-');
		const prefix = id.substr(0, i);
		const suffix = id.substr(i + 1);
		switch (prefix) {
			case 'e':
				let data = fs.readFileSync(`examples/${suffix}.zip`);
				if (data[0] != 80) data = data.subarray(1);
				return Promise.resolve(data);
			case 'm':
				return this.loadMovieFromNum(Number.parseInt(suffix));
		}
	},
	loadMovieFromNum(id) {
		const zip = nodezip.create();
		const filePath = fUtil.getFileIndex('movie-', '.xml', id);
		if (!fs.existsSync(filePath)) return Promise.reject();
		return parseMovie(zip, fs.readFileSync(filePath));
	},
	getNumId(movieId) {
		if (!movieId) return fUtil.
			getNextFileId('movie-', '.xml');
		const i = movieId.indexOf('-');
		const prefix = movieId.substr(0, i);
		const suffix = movieId.substr(i + 1);
		switch (prefix) {
			case 'm': case '': return Number.parseInt(suffix);
			case 'e': default: return fUtil.fillNextFileId('movie-', '.xml');
		}
	},
	saveXmlStream(stream, numId) {
		return new Promise(res => {
			const writeStream = fs.createWriteStream(
				fUtil.getFileIndex('movie-', '.xml', numId));

			var buffers = [];
			stream.on('data', b => buffers.push(b));
			stream.on('end', () => {
				var data = Buffer.concat(buffers).slice(0, -7);
				const t = caché[numId];

				for (const name in t)
					if (data.includes(name))
						data = Buffer.concat([data, Buffer.from(`<asset name="${name}">${t[name].toString('base64')}</asset>`)]);
					else
						delete t[name];
				data.write(`</film>`);

				writeStream.write(data, () => {
					writeStream.close();
					res();
				});
			});
		});
	},
	async saveMovie(buffer, meta, id) {
		const zip = nodezip.unzip(buffer);
		return await this.saveXmlStream(zip['movie.xml'].toReadStream(), id);
	},
	saveAsset(numId, buffer) {
		const id = this.generateId();
		if (!caché[numId])
			caché[numId] = {};
		var t = caché[numId];
		t[id] = buffer;
		return id;
	},
	/**
	 * 
	 * @param {number} numId 
	 * @param {string} assetId 
	 */
	loadAsset(numId, assetId) {
		return caché[numId][assetId];
	},
}