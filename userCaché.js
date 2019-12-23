const fUtil = require('./fileUtil');
const fs = require('fs');
const charProps = {};
const itemProps = {};

function processChar(fn) {
	const b = fs.readFileSync(fn);
	const i = b.indexOf('theme_id="');
	const nice = b.slice(i, i + 69);
	const theme = nice.slice(0, nice.indexOf('"')).toString();
	charProps[]
}

for (var c = 0, fn; fs.existsSync(fn = fUtil.getFileIndex('char-', '.xml', c)); c++)
	fs.readFileSync(fn);
