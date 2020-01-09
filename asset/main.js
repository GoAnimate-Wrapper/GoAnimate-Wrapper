const caché = require('../movie/caché');
const sessions = require('../sessions');
const info = require('./info');

function getFilter(mId, types) {
	const typeSet = {}, files = caché.getMovieCaché(mId), ret = [];
	types.forEach(v => typeSet[v] = true);
	for (const id in files) {
		const dot = id.lastIndexOf('.');
		const name = id.substr(0, dot);
		const ext = id.substr(dot + 1);
		if (!name.includes('.') && typeSet[ext])
			ret.push({ name: name, id: id, });
	}
	return ret;
}

module.exports = {
	load(mId, aId) { return caché.loadAsset(mId, aId); },
	save(buffer, mId, ext) { return caché.saveAsset(buffer, mId, ext); },
	getBackgrounds(mId) { return getFilter(mId, info.bg.filetypes); },
	getProps(mId) { return getFilter(mId, info.prop.filetypes); },
	getSounds(mId) { return getFilter(mId, info.sound.filetypes); },
};