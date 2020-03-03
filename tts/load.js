const http = require('http');
const loadPost = require('../request/post_body');
const mp3Duration = require('mp3-duration');
const voices = require('./info').voices;
const asset = require('../asset/main');
const get = require('../request/get');
const qs = require('querystring');
const https = require('https');

function processVoice(voiceName, text) {
	return new Promise((res, rej) => {
		const voice = voices[voiceName];
		switch (voice.source) {
			case 'polly': {
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
						if (json.file) get(`https://pollyvoices.com${json.file}`).then(res);
						else rej();
					});
				});
				req.write(qs.encode({ text: text, voice: voice.arg }));
				req.end();
				break;
			}
			case 'cepstral':
			case 'voiceforge': {
				https.get('https://www.voiceforge.com/demo', r => {
					const cookie = r.headers['set-cookie'];
					var q = qs.encode({
						voice: voice.arg,
						voiceText: text,
					});
					var buffers = [];
					var req = https.get({
						host: 'www.voiceforge.com',
						path: `/demos/createAudio.php?${q}`,
						headers: { Cookie: cookie },
						method: 'GET',
					}, r => {
						r.on('data', b => buffers.push(b));
						r.on('end', () => {
							const html = Buffer.concat(buffers);
							const beg = html.indexOf('id="mp3Source" src="') + 20;
							const end = html.indexOf('"', beg);
							const loc = html.subarray(beg, end).toString();
							get(`https://www.voiceforge.com${loc}`).then(res).catch(rej);
						})
					});
				});
				break;
			}
			case 'vocalware': {
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
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
					},
				}, r => {
					var buffers = [];
					r.on('data', d => buffers.push(d));
					r.on('end', () => res(Buffer.concat(buffers)));
					r.on('error', rej);
				});
				break;
			}
			case 'voicery': {
				var q = qs.encode({
					text: text,
					speaker: voice.arg,
					ssml: text.includes('<'),
					//style: 'default',
				});
				https.get({
					host: 'www.voicery.com',
					path: `/api/generate?${q}`,
				}, r => {
					var buffers = [];
					r.on('data', d => buffers.push(d));
					r.on('end', () => res(Buffer.concat(buffers)));
					r.on('error', rej);
				});
				break;
			}
			case 'watson': {
				var q = qs.encode({
					text: text,
					voice: voice.arg,
					download: true,
					accept: "audio/mp3",
				});
				console.log(https.get({
					host: 'text-to-speech-demo.ng.bluemix.net',
					path: `/api/v1/synthesize?${q}`,
				}, r => {
					var buffers = [];
					r.on('data', d => buffers.push(d));
					r.on('end', () => res(Buffer.concat(buffers)));
					r.on('error', rej);
				}));
				break;
			}
			case 'acapela': {
				var q = qs.encode({
					cl_login: "VAAS_MKT",
					req_snd_type: "",
					req_voice: voice.arg,
					cl_app: "seriousbusiness",
					req_text: text,
					cl_pwd: "M5Awq9xu",
				});
				console.log(http.get({
					host: 'vaassl3.acapela-group.com',
					path: `/Services/AcapelaTV/Synthesizer?${q}`,
					method: 'GET',
				}, r => {
					var buffers = [];
					r.on('data', d => buffers.push(d));
					r.on('end', () => {
							const html = Buffer.concat(buffers);
							const beg = html.indexOf('&snd_url=') + 9;
							const end = html.indexOf('&', beg);
                            const loc = `https${html.subarray(beg+4, end).toString()}`;
                            get(loc).then(res).catch(rej);
						})
					r.on('error', rej);
				}));
				break;
			}
		}
	});
}

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/convertTextToSoundAsset/') return;
	loadPost(req, res).then(data => {
		processVoice(data.voice, data.text).then(buffer => {
			mp3Duration(buffer, (e, duration) => {
				if (e || !duration) return res.end(1 + process.env.FAILURE_XML);

				const title = `[${voices[data.voice].desc}] ${data.text}`;
				const id = asset.saveLocal(buffer, data.presaveId, '-tts.mp3');
				res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${title}</title><published>0</published><tags></tags><duration>${1e3 * duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`)
			});
		});
	});
	return true;
}