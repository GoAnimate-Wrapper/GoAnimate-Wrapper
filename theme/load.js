const loadPost = require('../request/post_body');
const folder = process.env.THEME_FOLDER;
const fUtil = require('../fileUtil');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getTheme/') return;
	loadPost(req, res).then(data => {
		res.setHeader('Content-Type', 'application/zip');
		fUtil.zippy(`${folder}/${data.themeId}.xml`, 'theme.xml').then(b => res.end(b));
	});
	return true;
}