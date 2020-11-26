const qs = require("querystring");

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {boolean} parse
 */
module.exports = function (req, res) {
	return new Promise((resolve, rej) => {
		var data = "";
		req.on("data", (v) => {
			data += v;
			if (data.length > 1e10) {
				data = "";
				res.writeHead(413);
				res.end();
				req.connection.destroy();
				rej();
			}
		});

		req.on("end", () => {
			var dict = qs.parse(data);
			var mId = dict.movieId || dict.presaveId;
			resolve([dict, mId]);
		});
	});
};
