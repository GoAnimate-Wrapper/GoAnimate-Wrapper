const chars = require("../character/main");
const caché = require("../data/caché");
const fUtil = require("../misc/file");

module.exports = {
	load(mId, aId) {
		return caché.load(mId, aId);
	},
	save(buffer, mId, mode, ext) {
		var suffix = `-${mode}.${ext}`;
		return caché.newItem(buffer, mId, "", suffix);
	},
	list(mId, mode) {
		var ret = [];
		var files = caché.list(mId);
		files.forEach((aId) => {
			var dot = aId.lastIndexOf(".");
			var dash = aId.lastIndexOf("-");
			var name = aId.substr(0, dash);
			var ext = aId.substr(dot + 1);
			var fMode = aId.substr(dash + 1, dot - dash - 1);
			if (fMode == mode) {
				ret.push({ id: aId, ext: ext, name: name, mode: fMode });
			}
		});
		return ret;
	},
	listAll(mId) {
		var ret = [];
		var files = caché.list(mId);
		files.forEach((aId) => {
			var dot = aId.lastIndexOf(".");
			var dash = aId.lastIndexOf("-");
			var name = aId.substr(0, dash);
			var ext = aId.substr(dot + 1);
			var fMode = aId.substr(dash + 1, dot - dash - 1);
			ret.push({ id: aId, ext: ext, name: name, mode: fMode });
		});
		return ret;
	},
	async chars(theme) {
		switch (theme) {
			case "custom":
				theme = "family";
				break;
			case "action":
			case "animal":
			case "space":
			case "vietnam":
				theme = "cc2";
				break;
		}

		const table = [];
		const ids = fUtil.getValidFileIndicies("char-", ".xml");
		for (let c = 0; c < ids.length; c++) {
			const v = ids[c];
			const id = `c-${v}`;
			if (theme == (await chars.getTheme(id))) table.unshift({ theme: theme, id: id });
		}
		return table;
	},
};
