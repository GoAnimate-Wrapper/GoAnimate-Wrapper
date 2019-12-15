const info = require('./ttsInfo');
const voices = info.voices, langs = {};
Object.keys(voices).forEach(i => {
	const v = voices[i], l = v.language;
	langs[l] = langs[l] || [];
	langs[l].push(`<voice id="${i}" desc="${i}" sex="${v.gender}" demo-url="" country="${v.country}" plus="N"/>`);
})

const xml = `<?xml version="1.0"?><voices>${
	Object.keys(langs).map(i => {
		const v = langs[i], l = info.languages[i];
		return `<language id="${i}" desc="${l}">${v.join('')}</language>`;
	}).join('')}</voices>`;

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getTextToSpeechVoices/') return;
	res.setHeader('Content-Type', 'text/html; charset=UTF-8');
	res.end(xml);
	return true;
}