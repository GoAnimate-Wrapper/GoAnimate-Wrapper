const loadPost = require('./loadPostBody')
const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/saveCCCharacter/') return;
	loadPost(req, res).then(data => {
		fs.writeFile(`./files/char-${666}.xml`, data.body,
			e => e ? res.end('10') : res.end('00'));
	});
	return true;
}