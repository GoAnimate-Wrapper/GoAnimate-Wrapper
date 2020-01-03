const folder = process.env.PREVIEW_FOLDER;
const fs = require('fs');
module.exports = {
	push(dataStr, ip) {
		const fn = `${folder}/${ip}.xml`;
		const ws = fs.createWriteStream(fn, { flags: 'a' });
		dataStr.pipe(ws);
		return ws;
	},
	pop(ip) {
		const fn = `${folder}/${ip}.xml`;
		const stream = fs.createReadStream(fn);
		stream.on('end', () => fs.unlinkSync(fn));
		return stream;
	}
}