const themeFolder = process.env.THEME_FOLDER;
const mp3Duration = require('mp3-duration');
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

function getCffFontFile(font) {
	switch (font) {
		case "Arial":
			return "arial";
		case "Blambot Casual":
			return "causal";
		case "BadaBoom BB":
			return "boom";
		case "Entrails BB":
			return "entrails";
		case "Tokyo Robot Intl BB":
			return "tokyo";
		case "Accidental Presidency":
			return "accidental";
		case "BodoniXT":
			return "bodoni_xt";
		case "Budmo Jiggler":
			return "bjiggler";
		case "Budmo Jigglish":
			return "bjigglish";
		case "Existence Light":
			return "existence";
		case "HeartlandRegular":
			return "heartland";
		case "Honey Script":
			return "honey";
		case "I hate Comic Sans":
			return "ihate";
		case "Impact Label":
			return "impact_label";
		case "loco tv":
			return "locotv";
		case "Mail Ray Stuff":
			return "mail_ray";
		case "Mia\'s Scribblings ~":
			return "mia";
		case "Shanghai":
			return "shanghai";
		case "Comic Book":
			return "comic_book";
		case "Wood Stamp":
			return "wood_stamp";
		case "Brawler":
			return "brawler";
		case "Coming Soon":
			return "coming_soon";
		case "Glegoo":
			return "glegoo";
		case "Lilita One":
			return "lilita_one";
		case "Telex Regular":
			return "telex";
		case "Claire Hand":
			return "claire_hand";
		case "Oswald":
			return "oswald";
		case "Poiret One":
			return "poiretone";
		case "Raleway":
			return "raleway";
		case "Bangers":
			return "bangers";
		case "Creepster":
			return "creepster";
		case "BlackoutMidnight":
			return "blackoutmidnight";
		case "BlackoutSunrise":
			return "backoutsunrise";
		case "Junction":
			return "junction";
		case "LeagueGothic":
			return "leaguegothic";
		case "LeagueSpartan":
			return "leaguespartan";
		case "OstrichSansMedium":
			return "ostrichsansmedium";
		case "Prociono":
			return "prociono";
		case "Lato":
			return "lato";
		case "Alegreya Sans SC":
			return "alegreyasanssc";
		case "Barrio":
			return "barrio";
		case "Bungee Inline":
			return "bungeeinline";
		case "Bungee Shade":
			return "bungeeshade";
		case "Gochi Hand":
			return "gochihand";
		case "IM Fell English SC":
			return "imfellenglishsc";
		case "Josefin":
			return "josefin";
		case "Kaushan":
			return "kaushan";
		case "Lobster":
			return "lobster";
		case "Montserrat":
			return "montserrat";
		case "Mouse Memoirs":
			return "mousememoirs";
		case "Patrick Hand":
			return "patrickhand";
		case "Permanent Marker":
			return "permanentmarker";
		case "Satisfy":
			return "satisfy";
		case "Sriracha":
			return "sriracha";
		case "Teko":
			return "teko";
		case "Vidaloka":
			return "vidaloka";
		case '':
		case null:
			return '';
		default:
			return `CffFontFile${font}`;
	}
}

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
		const themes = { common: true }, assetTypes = {};
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
						const m = useBase64(aId) ? 'base64' : 'utf8', b = Buffer.from(element.val, m);
						const d = await new Promise(res => mp3Duration(b, (e, d) => e || res(Math.floor(1e3 * d))));
						const t = assetTypes[aId];
						//const n = `ugc.${t}.${aId}`;
						//fUtil.addToZip(zip, n, b);
						ugcString += `<sound subtype="${t.subtype}" id="${aId
							}" name="${t.name}" downloadtype="progressive" duration="${d}"/>`;
						caché.save(mId, aId, b);
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

					var ttsData = element.childNamed('ttsdata');
					if (sfile.endsWith('.swf')) {
						const pieces = sfile.split('.');
						const theme = pieces[0], name = pieces[1];
						const url = `${store}/${theme}/sound/${name}.swf`;
						const fileName = `${theme}.sound.${name}.swf`;
						const buffer = await get(url);
						fUtil.addToZip(zip, fileName, buffer);
					}
					else if (sfile.startsWith('ugc.')) {
						var subtype, name;
						if (ttsData) {
							const text = ttsData.childNamed('text').val;
							const voice = ttsInfo.voices[ttsData.childNamed('voice').val].desc;
							name = `[${voice}] ${text.replace(/"/g, '\\"')}`;
							subtype = 'tts';
						} else {
							subtype = 'sound';
							name = file;
						}

						assetTypes[file] = {
							subtype: subtype,
							name: name,
						};
					}
					break;
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
										break;
									}
								}

								for (const ptK in piece.children) {
									const part = piece.children[ptK];
									if (!part.children) continue;

									var urlF, fileF;
									switch (part.name) {
										case 'head':
											urlF = 'char';
											fileF = 'prop';
											break;
										case 'prop':
											urlF = 'prop';
											fileF = 'prop';
											break;
										default:
											continue;
									}

									const file = part.childNamed('file');
									const slicesP = file.val.split('.');
									slicesP.pop(), slicesP.splice(1, 0, urlF);
									const urlP = `${store}/${slicesP.join('/')}.swf`;

									slicesP.splice(1, 1, fileF);
									const fileP = `${slicesP.join('.')}.swf`;
									fUtil.addToZip(zip, fileP, await get(urlP));
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
								const font = getCffFontFile(text.attr.font);
								const fontSrc = `${source}/go/font2/FontFile${font}.swf`;
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
