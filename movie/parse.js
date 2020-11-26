var themeFolder = process.env.THEME_FOLDER;
var mp3Duration = require("mp3-duration");
var char = require("../character/main");
var ttsInfo = require("../tts/info");
var source = process.env.CLIENT_URL;
var header = process.env.XML_HEADER;
var get = require("../misc/get");
var fUtil = require("../misc/file");
var nodezip = require("node-zip");
var store = process.env.STORE_URL;
var xmldoc = require("xmldoc");
var fs = require("fs");

function name2Font(font) {
	switch (font) {
		case "Blambot Casual":
			return "FontFileCasual";
		case "BadaBoom BB":
			return "FontFileBoom";
		case "Entrails BB":
			return "FontFileEntrails";
		case "Tokyo Robot Intl BB":
			return "FontFileTokyo";
		case "Accidental Presidency":
			return "FontFileAccidental";
		case "BodoniXT":
			return "FontFileBodoniXT";
		case "Budmo Jiggler":
			return "FontFileBJiggler";
		case "Budmo Jigglish":
			return "FontFileBJigglish";
		case "Existence Light":
			return "FontFileExistence";
		case "HeartlandRegular":
			return "FontFileHeartland";
		case "Honey Script":
			return "FontFileHoney";
		case "I hate Comic Sans":
			return "FontFileIHate";
		case "Impact Label":
			return "FontFileImpactLabel";
		case "loco tv":
			return "FontFileLocotv";
		case "Mail Ray Stuff":
			return "FontFileMailRay";
		case "Mia's Scribblings ~":
			return "FontFileMia";
		case "Shanghai":
			return "FontFileShanghai";
		case "Comic Book":
			return "FontFileComicBook";
		case "Wood Stamp":
			return "FontFileWoodStamp";
		case "Brawler":
			return "FontFileBrawler";
		case "Coming Soon":
			return "FontFileCSoon";
		case "Glegoo":
			return "FontFileGlegoo";
		case "Lilita One":
			return "FontFileLOne";
		case "Telex Regular":
			return "FontFileTelex";
		case "Claire Hand":
			return "FontFileClaireHand";
		case "Oswald":
			return "FontFileOswald";
		case "Poiret One":
			return "FontFilePoiretOne";
		case "Raleway":
			return "FontFileRaleway";
		case "Bangers":
			return "FontFileBangers";
		case "Creepster":
			return "FontFileCreepster";
		case "BlackoutMidnight":
			return "FontFileBlackoutMidnight";
		case "BlackoutSunrise":
			return "FontFileBlackoutSunrise";
		case "Junction":
			return "FontFileJunction";
		case "LeagueGothic":
			return "FontFileLeagueGothic";
		case "LeagueSpartan":
			return "FontFileLeagueSpartan";
		case "OstrichSansMedium":
			return "FontFileOstrichSansMedium";
		case "Prociono":
			return "FontFileProciono";
		case "Lato":
			return "FontFileLato";
		case "Alegreya Sans SC":
			return "FontFileAlegreyaSansSC";
		case "Barrio":
			return "FontFileBarrio";
		case "Bungee Inline":
			return "FontFileBungeeInline";
		case "Bungee Shade":
			return "FontFileBungeeShade";
		case "Gochi Hand":
			return "FontFileGochiHand";
		case "IM Fell English SC":
			return "FontFileIMFellEnglishSC";
		case "Josefin":
			return "FontFileJosefin";
		case "Kaushan":
			return "FontFileKaushan";
		case "Lobster":
			return "FontFileLobster";
		case "Montserrat":
			return "FontFileMontserrat";
		case "Mouse Memoirs":
			return "FontFileMouseMemoirs";
		case "Patrick Hand":
			return "FontFilePatrickHand";
		case "Permanent Marker":
			return "FontFilePermanentMarker";
		case "Satisfy":
			return "FontFileSatisfy";
		case "Sriracha":
			return "FontFileSriracha";
		case "Teko":
			return "FontFileTeko";
		case "Vidaloka":
			return "FontFileVidaloka";
		case "":
		case null:
			return "";
		default:
			return `FontFile${font}`;
	}
}

function useBase64(aId) {
	if (aId.endsWith("-starter.xml")) return true;
	switch (aId.substr(aId.lastIndexOf(".") + 1)) {
		case "xml":
			return false;
		default:
			return true;
	}
}

module.exports = {
	/**
	 * @summary Reads an XML buffer, decodes the elements, and returns a PK stream the LVM can parse.
	 * @param {Buffer} xmlBuffer
	 * @param {string} mId
	 * @returns {Promise<{zipBuf:Buffer,caché:{[aId:string]:Buffer}}>}
	 */
	async packMovie(xmlBuffer, mId = null) {
		if (xmlBuffer.length == 0) throw null;
		var zip = nodezip.create();
		var themes = { common: true };
		var ugcString = `${header}<theme id="ugc" name="ugc">`;
		var assetBuffers = {};
		var ugcData = {};

		fUtil.addToZip(zip, "movie.xml", xmlBuffer);
		var xml = new xmldoc.XmlDocument(xmlBuffer);

		var elements = xml.children;
		for (var eK in elements) {
			var element = elements[eK];
			switch (element.name) {
				case "scene": {
					for (var pK in element.children) {
						var piece = element.children[pK];
						var data = piece.name;
						if (data == "effectAsset") {
							data = "effect";
						}

						switch (data) {
							case "durationSetting":
							case "trans":
								break;
							case "bg":
							case "effect":
							case "prop": {
								var file = piece.childNamed("file");
								if (!file) continue;
								var val = file.val;

								if (val.startsWith("ugc")) {
									var aId = val.substr(4);
									ugcData[aId] = { type: data, subtype: data, name: aId };
								} else {
									var slices = val.split(".");
									var ext = slices.pop();
									slices.splice(1, 0, data);
									slices[slices.length - 1] += `.${ext}`;

									var fileName = slices.join(".");
									if (!zip[fileName]) {
										var buff = await get(`${store}/${slices.join("/")}`);
										fUtil.addToZip(zip, fileName, buff);
										themes[slices[0]] = true;
									}
								}
								break;
							}
							case "char": {
								var val = piece.childNamed("action").val;
								var slices = val.split(".");

								var theme, ccTheme, fileName, buffer;
								switch (slices[slices.length - 1]) {
									case "xml": {
										theme = slices[0];
										var id = slices[1];
										fileName = `${theme}.char.${id}.xml`;
										var prefix = id.substr(0, id.indexOf("-"));

										switch (prefix) {
											case "C":
												break;
											case "c":
											default:
												try {
													ccTheme = await char.getTheme(id);
												} catch (e) {
													ccTheme = "family";
												}
												break;
										}
										break;
									}
									case "swf": {
										var ch = slices[1];
										var model = slices[2];
										ccTheme = theme = slices[0];
										var url = `${store}/${theme}/char/${ch}/${model}.swf`;
										fileName = `${theme}.char.${ch}.${model}.swf`;
										buffer = await get(url);
										break;
									}
								}

								var ugcCharSubs = [];
								for (let ptK in piece.children) {
									var part = piece.children[ptK];
									if (!part.children) continue;

									var file = part.childNamed("file");
									if (!file) continue;
									var fName = file ? file.val : part.val;
									var slicesP = fName.split(".");
									if (slicesP[0] == "ugc") {
										switch (part.name) {
											case "head":
												ugcCharSubs[slicesP[3]] = "facial";
												break;
											case "action":
												ugcCharSubs[slicesP[2]] = "action";
												break;
											default:
												continue;
										}
									} else if (slicesP.length > 1) {
										var urlF, fileF;
										switch (part.name) {
											case "head":
												urlF = "char";
												fileF = "prop";
												break;
											case "prop":
												urlF = "prop";
												fileF = "prop";
												break;
											default:
												continue;
										}

										slicesP.pop(), slicesP.splice(1, 0, urlF);
										var urlP = `${store}/${slicesP.join("/")}.swf`;

										slicesP.splice(1, 1, fileF);
										var fileP = `${slicesP.join(".")}.swf`;
										if (!zip[fileP]) {
											fUtil.addToZip(zip, fileP, await get(urlP));
										}
									}
								}

								themes[theme] = true;
								if (buffer) fUtil.addToZip(zip, fileName, buffer);
								if (ugcData[id]) {
									Object.assign(ugcData[id].subs, ugcCharSubs);
								} else if (id) {
									ugcData[id] = {
										type: "char",
										subs: ugcCharSubs,
										theme: ccTheme,
									};
								}
								break;
							}
							case "bubbleAsset": {
								var bubble = piece.childNamed("bubble");
								var text = bubble.childNamed("text");
								var font = `${name2Font(text.attr.font)}.swf`;
								var fontSrc = `${source}/go/font/${font}`;
								if (!zip[font]) {
									fUtil.addToZip(zip, font, await get(fontSrc));
								}
								break;
							}
						}
					}
					break;
				}

				case "sound": {
					var sfile = element.childNamed("sfile").val;
					var file = sfile.substr(sfile.indexOf(".") + 1);

					var ttsData = element.childNamed("ttsdata");
					if (sfile.endsWith(".swf")) {
						var slices = sfile.split(".");
						var [theme, name] = slices;
						var url = `${store}/${theme}/sound/${name}.swf`;
						var fileName = `${theme}.sound.${name}.swf`;
						if (!zip[fileName]) {
							var buffer = await get(url);
							fUtil.addToZip(zip, fileName, buffer);
						}
						ugcString += `<sound subtype="sound" id="${name}.swf" name="${name}.swf" downloadtype="progressive"/>`;
					} else if (sfile.startsWith("ugc.")) {
						var subtype, fileName;
						if (ttsData) {
							var text = ttsData.childNamed("text").val;
							var vName = ttsData.childNamed("voice").val;
							var vInfo = ttsInfo.voices[vName];
							if (vInfo) {
								fileName = `[${vInfo.desc}] ${text.replace(/"/g, '\\"')}`;
							} else {
								fileName = text.replace(/"/g, '\\"');
							}
							subtype = "tts";
						} else {
							subtype = "sound";
							fileName = file;
						}

						ugcData[file] = {
							type: "sound",
							subtype: subtype,
							name: fileName,
						};
					}
					break;
				}

				case "cc_char": {
					var beg = element.startTagPosition - 1;
					var end = xmlBuffer.indexOf("</cc_char>", beg) + 10;
					var sub = xmlBuffer.subarray(beg, end);

					var fileName = element.attr.file_name;
					var id = fileName.substr(9, fileName.indexOf(".", 9) - 9);
					var theme = await char.getTheme(await char.save(sub, id));
					if (ugcData[id]) ugcData[id].theme = theme;
					themes[theme] = true;

					fUtil.addToZip(zip, fileName, sub);
					//assetBuffers[`${id}.xml`] = sub;
					break;
				}

				case "asset": {
					if (!mId) continue;
					var aId = element.attr.id;
					var m = useBase64(aId) ? "base64" : "utf8";
					var b = Buffer.from(element.val, m);
					var t = ugcData[aId];
					if (!t) continue;

					switch (t.subtype) {
						case "tts":
						case "sound": {
							var d = await new Promise((res) => mp3Duration(b, (e, d) => e || res(Math.floor(1e3 * d))));
							ugcString += `<sound subtype="${t.subtype}" id="${aId}" name="${t.name}" downloadtype="progressive" duration="${d}"/>`;
							break;
						}
						case "bg":
							ugcString += `<background id="${aId}" thumb="${aId}" aid="${aId}" enc_asset_id="${aId}"/>`;
					}
					assetBuffers[aId] = b;
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

		for (const t in themes) {
			switch (t) {
				case "common":
					break;
				case "ugc":
				default:
					continue;
			}
			var file = fs.readFileSync(`${themeFolder}/${t}.xml`);
			fUtil.addToZip(zip, `${t}.xml`, file);
		}

		for (const id in ugcData) {
			var data = ugcData[id];
			switch (data.type) {
				case "char": {
					if (data.theme === undefined) {
						console.warn("Character theme undefined.");
						continue;
					}

					var subs = "";
					for (var subId in data.subs) subs += `<${data.subs[subId]} id="${subId}.xml" enable="Y"/>`;
					ugcString += `<char id="${id}"cc_theme_id="${data.theme}"><tags/>${subs}</char>`;
					try {
						var buffer = await char.load(id);
						fUtil.addToZip(zip, `ugc.${data.type}.${id}.xml`, buffer);
					} catch (e) {}
				}
				case "sound":
					continue;
			}
			var buffer = assetBuffers[id];
			fUtil.addToZip(zip, `ugc.${data.type}.${id}`, buffer);
		}

		var themeKs = Object.keys(themes);
		var themelist = Buffer.from(
			`${header}<themes>${themeKs
				.map((t) => {
					return `<theme>${t}</theme>`;
				})
				.join("")}</themes>`
		);

		fUtil.addToZip(zip, "themelist.xml", themelist);
		fUtil.addToZip(zip, "ugc.xml", Buffer.from(ugcString + `</theme>`));
		return { zipBuf: await zip.zip(), caché: assetBuffers };
	},
	/**
	 * @summary Given a PK stream from the LVM, returns an XML buffer to save locally.
	 * @param {nodezip.ZipFile} zipFile
	 * @param {Buffer} thumb
	 * @param {{[aId:string]:Buffer}} assetBuffers
	 * @returns {Promise<Buffer>}
	 */
	async unpackMovie(zipFile, thumb = null, assetBuffers = null) {
		return new Promise((res) => {
			var pieces = [];
			var stream = zipFile["movie.xml"].toReadStream();
			stream.on("data", (b) => pieces.push(b));
			stream.on("end", async () => {
				var mainSlice = Buffer.concat(pieces).slice(0, -7);
				var xmlBuffers = [];
				var charBuffers = {};
				var assetRemap = {};

				// Remaps UGC asset IDs to match the current Wrapper environment.
				for (let c = 0, end; ; c = mainSlice.indexOf("ugc.", c) + 4) {
					if (c == 0) continue;
					else if (c == 3) {
						xmlBuffers.push(mainSlice.subarray(end));
						break;
					}

					xmlBuffers.push(mainSlice.subarray(end, c));
					end = mainSlice.indexOf("<", c + 1);
					var assetId = mainSlice.subarray(c, end).toString();
					var index = assetId.indexOf("-");
					var prefix = assetId.substr(0, index);
					switch (prefix) {
						case "c": {
							var t = new Date().getTime();
							var dot = assetId.indexOf(".");
							var charId = assetId.substr(0, dot);
							var saveId = assetRemap[charId];
							if (!assetRemap[charId]) {
								saveId = assetRemap[charId] = `C-${~~(1e4 * Math.random())}-${t}`;
							}

							var remainder = assetId.substr(dot);
							xmlBuffers.push(Buffer.from(saveId + remainder));
							try {
								charBuffers[saveId] = await char.load(charId);
							} catch (e) {}
							break;
						}
						case "C": {
							var dot = assetId.indexOf(".");
							var charId = assetId.substr(0, dot);
							charBuffers[charId] = await char.load(charId);
							xmlBuffers.push(Buffer.from(assetId));
							break;
						}
						default: {
							xmlBuffers.push(Buffer.from(assetId));
							break;
						}
					}
				}

				// Appends base-64 encoded assets into XML.
				if (assetBuffers)
					for (let aId in assetBuffers) {
						var dot = aId.lastIndexOf(".");
						var dash = aId.lastIndexOf("-");
						//var mode = aId.substr(dash + 1, dot - dash - 1);

						if (useBase64(aId)) {
							var assetString = assetBuffers[aId].toString("base64");
							xmlBuffers.push(Buffer.from(`<asset id="${aId}">${assetString}</asset>`));
						} else xmlBuffers.push(Buffer.from(`<asset id="${aId}">${assetBuffers[aId]}</asset>`));
					}

				var hLen = header.length;
				for (let id in charBuffers) {
					var buff = charBuffers[id];
					var hasHeader = buff.subarray(0, hLen / 2).toString() == header.substr(0, hLen / 2);
					var start = buff.includes("file_name") ? buff.indexOf(".xml") + 6 : hasHeader ? hLen + 9 : 9;
					xmlBuffers.push(Buffer.from(`<cc_char file_name='ugc.char.${id}.xml' ${buff.subarray(start)}`));
				}

				if (thumb) {
					var thumbString = thumb.toString("base64");
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
	 * @param {mId} mId
	 */
	async unpackXml(xml, mId) {
		var i = mId.indexOf("-");
		var prefix = mId.substr(0, i);
		var suffix = mId.substr(i + 1);
		if (prefix == "m") {
			var beg = xml.lastIndexOf("<thumb>");
			var end = xml.lastIndexOf("</thumb>");
			if (beg > -1 && end > -1) {
				var sub = Buffer.from(xml.subarray(beg + 7, end).toString(), "base64");
				fs.writeFileSync(fUtil.getFileIndex("thumb-", ".png", suffix), sub);
			}
			fs.writeFileSync(fUtil.getFileIndex("movie-", ".xml", suffix), xml);
		}
	},
};
