const fs = require('fs');
module.exports = function (req, res, url) {
	if (req.method != 'POST' || !url.path.startsWith('/goapi/getMovie')) return;
	console.log(url.query.movieId);
	return true;
}