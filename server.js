const env = Object.assign(process.env, require('./env.json'));
const port = env.SERVER_PORT;

const http = require('http');
const chars = require('./getCharacter');
const static = require('./staticLoader');
const pages = require('./loadPages');
const url = require('url');

const functions = [
	pages,
	chars.srvr_goAPI,
	chars.srvr_get,
	static.local,
	static.remote,
];

http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);
	functions.forEach(f => f(req, res, parsedUrl));
}).listen(port - 0, console.log);