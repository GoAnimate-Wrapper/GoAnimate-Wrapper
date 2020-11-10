/**
 * @summary Holds a lookup map for session data.
 * @typedef {{movieId:string}} sessionType
 * @type {{[ip:string]:sessionType}}
 */
var caché = {};
module.exports = {
	getKey(req) {
		return req.headers["x-forwarded-for"] || "localhost";
	},
	set(data, req) {
		const key = this.getKey(req);
		caché[key] = caché[key] || {};
		Object.assign(caché[key], data);
	},
	get(req) {
		const ip = this.getKey(req);
		return caché[ip];
	},
	remove(req) {
		const ip = this.getKey(req);
		delete caché[ip];
	},
};
