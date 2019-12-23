const loadPost = require('./loadPostBody');
const voices = require('./ttsInfo').voices;
const mp3Duration = require('mp3-duration');
const caché = require('./movieCaché');
const qs = require('querystring');
const get = require('./reqGet');
const https = require('https');

function processVoice(voiceName, text) {
	return new Promise((res, rej) => {
		const voice = voices[voiceName];
		switch (voice.source) {
			case 'polly':
				var buffers = [];
				var req = https.request({
					hostname: 'pollyvoices.com',
					port: '443',
					path: '/api/sound/add',
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				}, r => {
					r.on('data', b => buffers.push(b));
					r.on('end', () => {
						var json = JSON.parse(Buffer.concat(buffers));
						get(`https://pollyvoices.com${json.file}`).then(res);
					});
				});
				req.write(qs.encode({ text: text, voice: voice.arg }));
				req.end();
				break;
			case 'cepstral':
				https.get('https://www.cepstral.com/en/demos', r => {
					const cookie = r.headers['set-cookie'];
					var q = qs.encode({
						voice: voice.arg,
						voiceText: text,
						rate: 170,
						pitch: 1,
						sfx: 'none',
					});
					var buffers = [];
					var req = https.get({
						host: 'www.cepstral.com',
						path: `/demos/createAudio.php?${q}`,
						headers: { Cookie: cookie },
						method: 'GET',
					}, r => {
						r.on('data', b => buffers.push(b));
						r.on('end', () => {
							var json = JSON.parse(Buffer.concat(buffers));
							get(`https://www.cepstral.com${json.mp3_loc}`).then(res).catch(rej);
						})
					});
				});
				break;
			case 'vocalware':
				var q = qs.encode({
					EID: voice.arg[0],
					LID: voice.arg[1],
					VID: voice.arg[2],
					TXT: text,
					IS_UTF8: 1,
					HTTP_ERR: 1,
					ACC: 3314795,
					API: 2292376,
					vwApiVersion: 2,
					CB: 'vw_mc.vwCallback',
				});
				var req = https.get({
					host: 'cache-a.oddcast.com',
					path: `/tts/gen.php?${q}`,
					method: 'GET',
					headers: {
						Referer: 'https://www.vocalware.com/index/demo',
						Origin: 'https://www.vocalware.com',
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
					},
				}, r => {
					var buffers = [];
					r.on('data', d => buffers.push(d));
					r.on('end', () => res(Buffer.concat(buffers)));
					r.on('error', rej);
				});
				break;
		}
	});
}

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/convertTextToSoundAsset/') return;
	loadPost(req, res).then(data => {
		const mId = data.movieId || data.presaveId;
		processVoice(data.voice, data.text).then(buffer => {
			const id = caché.saveAsset(mId, buffer);
			mp3Duration(buffer, (e, duration) => {
				if (e || !duration) res.end(1 + process.env.FAILURE_XML);
				else res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>[${voices[data.voice].desc}] ${data.text}</title><published>0</published><tags></tags><duration>${1e3 * duration}</duration><downloadtype>progressive</downloadtype><file>${id}.mp3</file></asset></response>`)
			});
		});
	});
	return true;
}