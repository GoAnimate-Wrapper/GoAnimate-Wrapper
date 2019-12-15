const loadPost = require('./loadPostBody');
const zippy = require('./zippy');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getTheme/') return;
	loadPost(req, res).then(data => {
		res.setHeader('Content-Type', 'application/zip');
		zippy(`themes/${data.themeId}.xml`, 'theme.xml').then(b => res.end(b));
	});
	return true;
}