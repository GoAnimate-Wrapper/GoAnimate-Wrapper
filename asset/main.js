const chars = require("../character/main");
const caché = require("../data/caché");
const fUtil = require("../fileUtil");

module.exports = {
	loadLocal(mId, aId) {
		return caché.loadLocal(mId, aId);
	},
	loadGlobal(aId) {
		return caché.loadGlobal(aId);
	},
	save(buffer, mId, library, mode, ext) {
		var suffix = `-${mode}.${ext}`;
		if (library == "comm") {
			caché.newGlobal(buffer, mId, "", suffix);
		} else {
			caché.newLocal(buffer, mId, "", suffix);
		}
	},
	list(library, mId, mode) {
		var ret = [];
		if (library == "comm") {
			var files = caché.listGlobal();
			// TODO: Add community library.
		} else {
			var files = caché.listLocal(mId);
			files.forEach((aId) => {
				var dot = aId.lastIndexOf(".");
				var dash = aId.lastIndexOf("-");
				var fMode = aId.substr(dash + 1, dot - dash - 1);
				var ext = aId.substr(dot + 1);
				if (fMode == mode) {
					ret.push({ id: aId, ext: ext });
				}
			});
		}
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
