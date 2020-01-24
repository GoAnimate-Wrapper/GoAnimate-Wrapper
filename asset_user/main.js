const chars = require('../character/main');
const fUtil = require('../fileUtil');

module.exports = {
	async loadChars(theme) {
		switch (theme) {
			case 'custom':
				theme = 'family';
				break;
		}

		const table = [];
		const ids = fUtil.getValidFileIndicies('char-', '.xml');
		for (let c = 0; c < ids.length; c++) {
			const v = ids[c];
			const id = `c-${v}`;
			if (theme == await chars.getTheme(id))
				table.unshift({ theme: theme, id: id, });
		}
		return table;
	}
}