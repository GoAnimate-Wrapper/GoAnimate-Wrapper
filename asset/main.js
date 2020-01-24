const caché = require('../data/caché');
const info = require('./info');

function getFilter(mId, types) {
	const typeSet = {}, files = caché.getTable(mId), ret = [];
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
	load(mId, aId) { return caché.load(mId, aId); },
	save(buffer, mId, suff) { return caché.saveNew(buffer, mId, suff); },
	getBackgrounds(mId) { return getFilter(mId, info.bg.filetypes); },
	getProps(mId) { return getFilter(mId, info.prop.filetypes); },
	getSounds(mId) { return getFilter(mId, info.sound.filetypes); },
};