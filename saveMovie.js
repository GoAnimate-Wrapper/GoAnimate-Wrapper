const loadPost = require('./loadPostBody');
const fUtil = require('./fileUtil');
const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/saveMovie/') return;
	loadPost(req, res).then(data => {
		var fn, id;
		if (data.movieId)
			fn = fUtil.getFileIndex('movie-', '.zip', data.movieId), id = data.movieId;
		else
			fn = fUtil.getNextFile('movie-', '.zip'), id = fn.substr(fn.lastIndexOf('/') + 1);
		const body = Buffer.from(data.body_zip, 'base64');
		fs.writeFile(fn, body, () => res.end('0' + id));
	});
	return true;
}