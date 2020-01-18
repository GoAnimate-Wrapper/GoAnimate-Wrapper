const themeFolder = process.env.THEME_FOLDER;
const char = require('../character/main');
const ttsInfo = require('../tts/info');
const source = process.env.CLIENT_URL;
const header = process.env.XML_HEADER;
const get = require('../request/get');
const fUtil = require('../fileUtil');
const nodezip = require('node-zip');
const store = process.env.STORE_URL;
const xmldoc = require('xmldoc');
const fs = require('fs');

module.exports = {
	xml2caché(buffer) {
		const xml = new xmldoc.XmlDocument(buffer);
		const cachéRef = {}, elements = xml.children;
		for (const eK in elements) {
			var element = elements[eK];
			if (element.name == 'asset')
				cachéRef[element.attr.id] =
					Buffer.from(element.val, 'base64');
		}
		return cachéRef;
	},
	async xml2zip(buffer, cachéCallback) {
		const zip = nodezip.create(), cachéRef = {};
		var ugcString = `${header}<theme id="ugc" name="ugc">`;
		const chars = {}, themes = { common: true };
		fUtil.addToZip(zip, 'movie.xml', buffer);
		const xml = new xmldoc.XmlDocument(buffer);
		const elements = xml.children;
		for (const eK in elements) {
			var element = elements[eK];
			switch (element.name) {

				case 'asset': {
					const v = Buffer.from(element.val, 'base64');
					cachéRef[element.attr.id] = v;
					break;
				}

				case 'sound': {
					const sfile = element.childNamed('sfile').val;
					const file = sfile.substr(sfile.indexOf('.') + 1);
					var xmlStr;

					var ttsData = element.childNamed('ttsdata');
					if (ttsData) {
						var text = ttsData.childNamed('text').val;
						var voice = ttsInfo.voices[ttsData.childNamed('voice').val].desc;
						var name = `[${voice}] ${text.replace(/"/g, '\\"')}`;
						xmlStr = `subtype="tts" id="${file}" name="${name}" downloadtype="progressive"`;
					}
					else
						xmlStr = `subtype="sound" id="${file}" name="${file}" downloadtype="progressive"`;
					ugcString += `<sound ${xmlStr}/>`;
					break;
				}

				case 'scene':
					for (const pK in element.children) {
						var piece = element.children[pK];
					/** @type string */ var val;
					/** @type [string] */ var pieces;
						switch (piece.name) {
							case 'durationSetting':
							case 'trans':
								break;
							case 'bg':
							case 'prop': {
								val = piece.childNamed('file').val;
								pieces = val.split('.');

								pieces.splice(1, 0, piece.name);
								var ext = pieces.pop();
								pieces[pieces.length - 1] += `.${ext}`;

								var name = pieces.join('.');
								var buff = await get(`${store}/${pieces.join('/')}`);
								fUtil.addToZip(zip, name, buff);
								themes[pieces[0]] = true;
								break;
							}
							case 'char': {
								val = piece.childNamed('action').val;
								pieces = val.split('.');
								let id = pieces[1];

								pieces.splice(1, 0, piece.name);
								themes[pieces[0]] = true;
								chars[id] = true;

								var theme;
								switch (pieces[pieces.length - 1]) {
									case 'xml':
										let c = await char.load(id), n = `${pieces[0]}.char.${pieces[2]}.xml`;
										theme = /theme_id="([^"]+)/.exec(c)[1];
										fUtil.addToZip(zip, n, Buffer.from(c));
										break;
								}
								ugcString += `<char id="${id}" cc_theme_id="${theme}"><tags/></char>`;
								break;
							}
							case 'bubbleAsset': {
								var bubble = piece.childNamed('bubble');
								var text = bubble.childNamed('text');
								const fontSrc = `${source}/go/font/FontFile${text.attr.font}.swf`;
								fUtil.addToZip(zip, `FontFile${text.attr.font}.swf`, await get(fontSrc));
								break;
							}
						}
					}
					break;
			}
		}

		cachéCallback(cachéRef);
		const themeKs = Object.keys(themes);
		themeKs.forEach(t => {
			if (t == 'ugc') return;
			const file = fs.readFileSync(`${themeFolder}/${t}.xml`);
			fUtil.addToZip(zip, `${t}.xml`, file);
		});

		fUtil.addToZip(zip, 'themelist.xml', Buffer.from(`${header}<themes>${
			themeKs.map(t => `<theme>${t}</theme>`).join('')}</themes>`));
		fUtil.addToZip(zip, 'ugc.xml', Buffer.from(ugcString + `</theme>`));
		return await zip.zip();
	},
	async zip2xml(zip, refCaché = {}) {
		return new Promise(res => {
			const buffers = [];
			const stream = zip['movie.xml'].toReadStream();
			stream.on('data', b => buffers.push(b));
			stream.on('end', () => {
				var xmlBuffers = [Buffer.concat(buffers).slice(0, -7)];
				for (const assetId in refCaché)
					if (xmlBuffers[0].includes(assetId)) {
						const assetString = refCaché[assetId].toString('base64');
						xmlBuffers.push(Buffer.from(`<asset id="${assetId}">${assetString}</asset>`));
					}
					else
						delete refCaché[assetId];

				xmlBuffers.push(Buffer.from(`</film>`));
				res(Buffer.concat(xmlBuffers));
			});
		});
	}
}