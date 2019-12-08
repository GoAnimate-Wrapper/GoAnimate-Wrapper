const loadPost = require('./loadPostBody');
const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getTheme/') return;
	loadPost(req, res).then(data => {
		res.setHeader('Content-Type', 'application/zip');
		fs.createReadStream(`themes/${data.themeId}.zip`).pipe(res);
	});
	return true;
}