if (!/^win/i.test(process.platform)) {
	console.log('How dare you run this server on a non-Windows device!  You know I can\'t use Internet Explorer on your machine.');
	console.log(`That's it: you're ${'grounded '.repeat(Math.floor(Math.random() * 7 + 13))}for ${('' + Math.random()).replace('0.', '')} years.`);
	process.exitCode = 666;
}

const env = Object.assign(process.env,
	require('./env.json'),
	require('./config.json'));

const http = require('http');
const saveChar = require('./saveCharacter');
const premade = require('./premadeChars');
const getChar = require('./getCharacter');
const static = require('./staticAssets');
const pages = require('./displayPages');
const getTheme = require('./getTheme');
const url = require('url');

const functions = [
	pages,
	premade,
	getChar,
	getTheme,
	saveChar,
	static,
];

http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);
	functions.forEach(f => f(req, res, parsedUrl));
}).listen(env.SERVER_PORT, console.log);