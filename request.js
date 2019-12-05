const https = require('https');
/**
 * @param {string} url
 * @param {CredentialRequestOptions} [options]
 * @returns {Promise}
 */
module.exports = function (url, options = {}) {
	var data = '';
	return new Promise((res, rej) => {
		https.get(url, options, o => o
			.on('data', v => data += v)
			.on('end', () => res(data))
			.on('error', rej));
	});
}