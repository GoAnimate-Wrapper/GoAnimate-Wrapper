const themeFolder = process.env.THEME_FOLDER;
const char = require('../character/main');
const ttsInfo = require('../tts/info');
const caché = require('../data/caché');
const source = process.env.CLIENT_URL;
const header = process.env.XML_HEADER;
const get = require('../request/get');
const fUtil = require('../fileUtil');
const nodezip = require('node-zip');
const store = process.env.STORE_URL;
const xmldoc = require('xmldoc');
const fs = require('fs');

function useBase64(aId) {
	switch (aId.substr(aId.lastIndexOf('.') + 1)) {
		case 'xml':
			return false;
		default:
			return true;
	}
}

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
	/**
	 * 
	 * @param {Buffer} xmlBuffer 
	 * @param {string} mId
	 * @returns {Promise<Buffer>}
	 */
	async packXml(xmlBuffer, mId = null) {
		if (xmlBuffer.length == 0) throw null;

		const zip = nodezip.create();
		mId && caché.saveTable(mId);
		const themes = { common: true };
		var ugcString = `${header}<theme id="ugc" name="ugc">`;
		fUtil.addToZip(zip, 'movie.xml', xmlBuffer);
		const xml = new xmldoc.XmlDocument(xmlBuffer);
		const elements = xml.children;
		for (const eK in elements) {
			var element = elements[eK];
			switch (element.name) {

				case 'asset': {
					if (mId) {
						const aId = element.attr.id;
						const m = useBase64(aId) ? 'base64' : 'utf8';
						const v = Buffer.from(element.val, m);
						caché.save(mId, aId, v);
					}
					break;
				}

				case 'cc_char': {
					const beg = element.startTagPosition - 1;
					const end = xmlBuffer.indexOf('</cc_char>', beg) + 10;
					const sub = xmlBuffer.subarray(beg, end);

					const name = element.attr.file_name;
					const id = name.substr(9, name.indexOf('.', 9) - 9);
					const theme = await char.getTheme(await char.save(sub, id));
					themes[theme] = true;

					fUtil.addToZip(zip, element.attr.file_name, sub);
					ugcString += `<char id="${id}"cc_theme_id="${theme}"><tags/></char>`;
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
					break; //we need to add something to the sound parsing a part that will check if it is a swf, and add it to the zip if it is a swf. I'm too scared of ruining everything to do it :P
				}

				case 'scene': {
					for (const pK in element.children) {
						var piece = element.children[pK];
						switch (piece.name) {
							case 'durationSetting':
							case 'trans':
								break;
							case 'bg':
							case 'effect':
							case 'prop': {
								var val = piece.childNamed('file').val;
								var pieces = val.split('.');

								if (pieces[0] == 'ugc') {
									// TODO: Make custom props load.
								}
								else {
									const ext = pieces.pop();
									pieces.splice(1, 0, piece.name);
									pieces[pieces.length - 1] += `.${ext}`;

									const name = pieces.join('.');
									const buff = await get(`${store}/${pieces.join('/')}`);
									fUtil.addToZip(zip, name, buff);
									themes[pieces[0]] = true;
								}
								break;
							}
							case 'char': {
								const val = piece.childNamed('action').val;
								const pieces = val.split('.');

								let theme, fileName, buffer;
								switch (pieces[pieces.length - 1]) {
									case 'xml': {
										theme = pieces[0];
										const id = pieces[1];

										try {
											buffer = await char.load(id);
											const charTheme = await char.getTheme(id);
											fileName = `${theme}.char.${id}.xml`;
											if (theme == 'ugc')
												ugcString += `<char id="${id}"cc_theme_id="${charTheme}"><tags/></char>`;
										} catch (e) {
											console.log(e);
										}
										break;
									}
									case 'swf': {
										theme = pieces[0];
										const char = pieces[1];
										const model = pieces[2];
										const url = `${store}/${theme}/char/${char}/${model}.swf`;
										fileName = `${theme}.char.${char}.${model}.swf`;
										buffer = await get(url);

										const head = piece.childNamed('head');
										if (head) {
											const piecesHead = head.childNamed('file').val.split('.');
											piecesHead.pop();

											piecesHead.splice(1, 0, 'char');
											const urlHead = `${store}/${piecesHead.join('/')}.swf`;
											piecesHead.splice(1, 1, 'prop');
											const fileNameHead = `${piecesHead.join('.')}.swf`;
											fUtil.addToZip(zip, fileNameHead, await get(urlHead));
										}
										break;
									}
								}
								if (buffer) {
									themes[theme] = true;
									fUtil.addToZip(zip, fileName, buffer);
								}
								break;
							}
							case 'bubbleAsset': {
								const bubble = piece.childNamed('bubble');
								const text = bubble.childNamed('text');
								const fontSrc = `${source}/go/font/FontFile${text.attr.font}.swf`;
								fUtil.addToZip(zip, `FontFile${text.attr.font}.swf`, await get(fontSrc));
								break;
							}
						}
					}
					break;
				}
			}
		}

		if (themes.family) {
			delete themes.family;
			themes.custom = true;
		}

		if (themes.cc2) {
			delete themes.cc2;
			themes.action = true;
		}

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
	/**
	 * 
	 * @param {{[aId:string]:Buffer}} buffers
	 * @param {Buffer} thumb
	 * @param {string} movieId
	 * @returns {Promise<Buffer>}
	 */
	async unpackZip(zip, thumb = null, movieId) {
		return new Promise(res => {

			const pieces = [];
			const stream = zip['movie.xml'].toReadStream();
			stream.on('data', b => pieces.push(b));
			stream.on('end', async () => {
				const time = new Date() - 0;
				const main = Buffer.concat(pieces).slice(0, -7);
				const xmlBuffers = [], assetHash = {};
				const charMap = {}, charBuffers = {};
				for (let c = 0, end; ; c = main.indexOf('ugc.', c) + 4) {

					if (c == 0) continue; else if (c == 3) {
						xmlBuffers.push(main.subarray(end));
						break;
					}

					xmlBuffers.push(main.subarray(end, c));
					const assetId = main.subarray(c, end =
						main.indexOf('<', c + 1)).toString();
					const index = assetId.indexOf('-');
					const prefix = assetId.substr(0, index);
					switch (prefix) {
						case 'c':
						case 'C': {
							const dot = assetId.indexOf('.');
							const charId = assetId.substr(0, dot);
							const saveId = charMap[charId] =
								charMap[charId] || `C-${c}-${time}`;
							const remainder = assetId.substr(dot);
							xmlBuffers.push(Buffer.from(saveId + remainder));
							try {
								charBuffers[saveId] = await char.load(charId);
							} catch (e) { };
							break;
						}
						default: {
							xmlBuffers.push(Buffer.from(assetId));
							assetHash[assetId] = true;
						}
					}
				}

				const assetBuffers = caché.getTable(movieId);
				for (const aId in assetBuffers) {
					if (!assetHash[aId]) continue;
					if (useBase64(aId)) {
						const assetString = assetBuffers[aId].toString('base64');
						xmlBuffers.push(Buffer.from(`<asset id="${aId}">${assetString}</asset>`));
					} else
						xmlBuffers.push(Buffer.from(`<asset id="${aId}">${assetBuffers[aId]}</asset>`));
				}

				for (const id in charBuffers) {
					const buff = charBuffers[id];
					var start = header.length + 9;;
					if (buff.includes('file_name'))
						start = buff.indexOf('.xml', start) + 6;
					const element = buff.subarray(start);
					xmlBuffers.push(Buffer.from(`<cc_char file_name='ugc.char.${id}.xml' ${element}`));
				}

				if (thumb) {
					const thumbString = thumb.toString('base64');
					xmlBuffers.push(Buffer.from(`<thumb>${thumbString}</thumb>`));
				}

				xmlBuffers.push(Buffer.from(`</film>`));
				res(Buffer.concat(xmlBuffers));
			});
		});
	},
	/**
	 * 
	 * @param {Buffer} xml 
	 * @param {number} id 
	 */
	async unpackXml(xml, id) {
		const beg = xml.lastIndexOf('<thumb>');
		const end = xml.lastIndexOf('</thumb>');
		if (beg > -1 && end > -1) {
			const sub = Buffer.from(xml.subarray(beg + 7, end).toString(), 'base64');
			fs.writeFileSync(fUtil.getFileIndex('thumb-', '.png', id), sub);
		}
		fs.writeFileSync(fUtil.getFileIndex('movie-', '.xml', id), xml);
	},
}
