const formidable = require('formidable');
const sessions = require('../sessions');
const asset = require('../asset/main');
const fs = require('fs');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/saveAsset') return;
	new formidable.IncomingForm().parse(req, (e, f, files) => {
		const path = files.import.path, buffer = fs.readFileSync(path);
		const ip = req.headers['x-forwarded-for'];
		const mId = sessions.get(ip);

		const name = files.import.name;
		const ext = name.substr(name.lastIndexOf('.') + 1);
		asset.save(buffer, mId, ext);
		fs.unlinkSync(path);
		res.end();
	});
	return true;
}