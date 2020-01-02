/*
if (!/^win/i.test(process.platform)) {
	console.log('How dare you run this server on a non-Windows device!  You know I can\'t use Internet Explorer on your machine.');
	console.log(`That's it: you're ${'grounded '.repeat(Math.floor(Math.random() * 7 + 13))}for ${('' + Math.random()).replace('0.', '')} years.`);
	process.exitCode = 666;
}
*/

const env = Object.assign(process.env,
	require('./env.json'),
	require('./config.json'));

const http = require('http');
const premadeChars = require('./character/premade');
const loadUserAssets = require('./asset/loaduser');
const saveCharacter = require('./character/save');
const loadCharacter = require('./character/load');
const displayPages = require('./static/pages');
const staticAssets = require('./static/load');
const savePreview = require('./preview/save');
const loadPreview = require('./preview/load');
const getThemeList = require('./theme/list');
const getVoices = require('./tts/voices');
const loadAsset = require('./asset/load');
const loadMovie = require('./movie/load');
const loadTheme = require('./theme/load');
const saveMovie = require('./movie/save');
const getThumbs = require('./getThumbs');
const ttsGet = require('./tts/load');
const url = require('url');

const functions = [
	getThumbs,
	premadeChars,
	loadAsset,
	loadCharacter,
	getThemeList,
	loadTheme,
	loadPreview,
	savePreview,
	saveCharacter,
	loadUserAssets,
	ttsGet,
	loadMovie,
	saveMovie,
	getVoices,
	displayPages,
	staticAssets,
];

http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);
	const found = functions.find(f => f(req, res, parsedUrl));
	if (!found) { res.statusCode = 404; res.end(); }
}).listen(env.PORT || env.SERVER_PORT, console.log);