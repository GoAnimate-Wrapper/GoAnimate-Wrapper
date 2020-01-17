const caché = require('../data/caché');
const parse = require('../data/parse');
const fUtil = require('../fileUtil');
const nodezip = require('node-zip');
const fs = require('fs');

module.exports = {
	async save(movieZip, thumbZip, oldId, nëwId = oldId) {
		if (thumbZip && nëwId.startsWith('m-')) {
			const n = Number.parseInt(nëwId.substr(2));
			const thumbFile = fUtil.getFileIndex('thumb-', '.png', n);
			fs.writeFileSync(thumbFile, thumbZip);
		}
		await caché.saveMovie(movieZip, oldId, nëwId);
		return nëwId;
	},
	loadZip(movieId) {
		return caché.loadMovie(movieId);
	},
	loadXml(movieId) {
		return new Promise((res, rej) => {
			const i = movieId.indexOf('-');
			const prefix = movieId.substr(0, i);
			const suffix = movieId.substr(i + 1);
			switch (prefix) {
				case 'm': {
					const fn = fUtil.getFileIndex('movie-', '.xml', suffix);
					fs.existsSync(fn) ? res(fs.readFileSync(fn)) : rej();
					break;
				}
				case 'e': {
					const fn = `${exFolder}/${suffix}.zip`;
					if (!fs.existsSync(fn)) return rej();
					parse.zip2xml(nodezip.unzip(fn))
						.then(v => res(v)).catch(e => rej(e));
					break;
				}
				default: rej();
			}
		});
	},
	thumb(movieId) {
		return new Promise((res, rej) => {
			if (!movieId.startsWith('m-')) return;
			const n = Number.parseInt(movieId.substr(2));
			const fn = fUtil.getFileIndex('thumb-', '.png', n);
			isNaN(n) ? rej() : res(fs.readFileSync(fn));
		});
	},
	list() {
		return fUtil.getValidFileIndicies('thumb-', '.png').map(v => `m-${v}`);
	},
	meta(movieId) {
		return new Promise((res, rej) => {
			if (!movieId.startsWith('m-')) return;
			const n = Number.parseInt(movieId.substr(2));
			const fn = fUtil.getFileIndex('movie-', '.xml', n);

			const fd = fs.openSync(fn, 'r');
			const buffer = Buffer.alloc(127);
			fs.readSync(fd, buffer, 0, 127, 0);
			const begTitle = buffer.indexOf('<title>') + 16;
			const endTitle = buffer.indexOf(']]></title>');
			const title = buffer.slice(begTitle, endTitle).toString().trim();

			const begDuration = buffer.indexOf('duration="') + 10;
			const endDuration = buffer.indexOf('"', begDuration);
			const duration = Number.parseFloat(
				buffer.slice(begDuration, endDuration));
			const min = ('' + ~~(duration / 60)).padStart(2, '0');
			const sec = ('' + ~~(duration % 60)).padStart(2, '0');
			const durationStr = `${min}:${sec}`;

			fs.closeSync(fd);
			res({
				date: fs.statSync(fn).mtime,
				durationString: durationStr,
				duration: duration,
				title: title,
				id: movieId,
			});
		});
	},
}