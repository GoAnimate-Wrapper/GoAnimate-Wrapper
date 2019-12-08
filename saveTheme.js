const loadPost = require('./loadPostBody');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/saveMovie/') return;
	loadPost(req, res).then(data => {
		console.log(data.body_zip);
		res.end(666);
	});
	return true;
}