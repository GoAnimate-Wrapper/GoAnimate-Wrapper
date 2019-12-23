const fs = require('fs');
module.exports = {
	saveStream(dataStr, id) {
		const fn = `previewFolder/${id}.xml`;
		const ws = fs.createWriteStream(fn, { flags: 'a' });
		dataStr.pipe(ws);
		return ws;
	},
	loadStream(id) {
		const fn = `previewFolder/${id}.xml`;
		const stream = fs.createReadStream(fn);
		stream.on('end', () => fs.unlinkSync(fn));
		return stream;
	}
}