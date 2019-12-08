const qs = require('querystring');

module.exports = function (req, res) {
	return new Promise((resolve, rej) => {
		var data = '';
		req.on('data', v => {
			data += v;
			if (data.length > 1e7) {
				data = '';
				res.writeHead(413).end();
				req.connection.destroy();
			}
		});

		req.on('end', () => resolve(qs.parse(data)));
	});
}