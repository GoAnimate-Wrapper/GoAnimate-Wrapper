const fUtil = require('./fileUtil');
const fs = require('fs');
const charThemes = {};

function process(fn) {
	const b = fs.readFileSync(fn);
	const i = b.indexOf('theme_id="');
	const nice = b.slice(i, i + 69);
	const theme = nice.slice(0, nice.indexOf('"')).toString();
	charThemes[]
}

for (var c = 0, fn; fs.existsSync(fn = fUtil.getFileIndex('char-', '.xml', c)); c++)
	fs.readFileSync(fn);
