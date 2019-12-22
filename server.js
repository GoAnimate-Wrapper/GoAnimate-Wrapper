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
const loadUserAssets = require('./loadUserAssets');
const saveCharacter = require('./saveCharacter');
const loadThemeList = require('./loadThemeList');
const loadCharacter = require('./loadCharacter');
const staticAssets = require('./staticAssets');
const premadeChars = require('./premadeChars');
const displayPages = require('./displayPages');
const savePreview = require('./savePreview');
const loadPreview = require('./loadPreview');
const ttsProcess = require('./ttsProcess');
const ttsVoices = require('./ttsVoices');
const saveMovie = require('./saveMovie');
const loadAsset = require('./loadAsset');
const loadMovie = require('./loadMovie');
const loadTheme = require('./loadTheme');
const getThumbs = require('./getThumbs');
const url = require('url');

const functions = [
	getThumbs,
	premadeChars,
	loadAsset,
	loadCharacter,
	loadThemeList,
	loadTheme,
	loadPreview,
	savePreview,
	saveCharacter,
	loadUserAssets,
	ttsProcess,
	loadMovie,
	saveMovie,
	ttsVoices,
	displayPages,
	staticAssets,
];

http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);
	const found = functions.find(f => f(req, res, parsedUrl));
	if (!found) { res.statusCode = 404; res.end(); }
}).listen(env.PORT || env.SERVER_PORT, console.log);