const char = require('./callCharacter');
const source = process.env.CLIENT_URL;
const header = process.env.XML_HEADER;
const store = process.env.STORE_URL;
const fUtil = require('./fileUtil');
const xmldoc = require('xmldoc');
const get = require('./reqGet');
const fs = require('fs');

module.exports = async function (zip, buffer, cachéRef) {
	var ugcString = `${header}<theme id="ugc" name="ugc">`;
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
					/** @type string */ var val;
					/** @type [string] */ var pieces;

					switch (piece.name) {
						case 'durationSetting':
						case 'trans':
							break;
						case 'bg':
						case 'prop':
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
						case 'char':
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
						case 'bubbleAsset':
							var bubble = piece.childNamed('bubble');
							var text = bubble.childNamed('text');
							const fontSrc = `${source}/go/font/FontFile${text.attr.font}.swf`;
							fUtil.addToZip(zip, `FontFile${text.attr.font}.swf`, await get(fontSrc));
							break;
						case 'asset':
							cachéRef[element.attr.name] = element.val;
							break;
					}
				}
				break;
		}
	}

	const themeKs = Object.keys(themes);
	themeKs.forEach(t => {
		if (t == 'ugc') return;
		const file = fs.readFileSync(`themes/${t}.xml`);
		fUtil.addToZip(zip, `${t}.xml`, file);
	});

	fUtil.addToZip(zip, 'themelist.xml', Buffer.from(`${header}<themes>${
		themeKs.map(t => `<theme>${t}</theme>`).join('')}</themes>`));
	fUtil.addToZip(zip, 'ugc.xml', Buffer.from(ugcString + `</theme>`));
	return await zip.zip();
}
