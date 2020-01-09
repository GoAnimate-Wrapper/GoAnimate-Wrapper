/**
 * @type {{[ip:string]:string}}
 */
var caché = {};
module.exports = {
	set(data, ip) {
		caché[ip] = data;
	},
	get(ip) {
		return caché[ip];
	},
	remove(ip) {
		delete caché[ip];
	},
}