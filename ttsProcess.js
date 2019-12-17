const loadPost = require('./loadPostBody');
const voices = require('./ttsInfo').voices;
const cache = require('./movieCache');
const mp3Duration = require('mp3-duration');
const request = require('./reqGet');

async function processVoice(voice, text) {
	const info = voices[voice];
	switch (info.source) {
		case 'polly':
			request('https://pollyvoices.com/api/sound/add', {

			})
			break;
	}
}

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/convertTextToSoundAsset/') return;
	loadPost().then(data => {
		processVoice(data.voice, data.text).then(buffer => {
			cache.addFile(buffer);
			const duration = mp3Duration(buffer, duration =>
				res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>[Joey] 666</title><published>0</published><tags></tags><duration>${duration}</duration><downloadtype>progressive</downloadtype><file>${id}.mp3</file></asset></response>`));
		});
	});
	return true;
}