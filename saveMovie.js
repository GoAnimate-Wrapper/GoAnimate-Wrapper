const loadPost = require('./loadPostBody');
const fUtil = require('./fileUtil');
const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/saveMovie/') return;
	loadPost(req, res).then(data => {
		if (data.movieId)
			fs.createReadStream(fUtil.getFileIndex('movie-', '.zip', data.movieId)).
				on('end', () => res(0 + data.movieId)).pipe(res, { end: false });
		else {
			const body = Buffer.from(data.body_zip, 'base64');
			const fn = fUtil.getNextFile('movie-', '.zip');
			fs.writeFile(fn, body, () => res.end(0 + fn.substr(fn.lastIndexOf('/') + 1)));
		}
	});
	return true;
}