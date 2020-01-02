const loadPost = require('../loadPostBody');
const fUtil = require('../fileUtil');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getTheme/') return;
	loadPost(req, res).then(data => {
		res.setHeader('Content-Type', 'application/zip');
		fUtil.zippy(`themes/${data.themeId}.xml`, 'theme.xml').then(b => res.end(b));
	});
	return true;
}