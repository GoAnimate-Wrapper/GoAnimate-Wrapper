const loadPost = require('./loadPostBody');
const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getCCPreMadeCharacters') return;
	loadPost(req, res).then(data => {
		const p = './premadeChars/' + data.themeId + '.xml';
		res.setHeader('Content-Type', 'text/html; charset=UTF-8');
		fs.createReadStream(p).pipe(res);
	});
	return true;
}