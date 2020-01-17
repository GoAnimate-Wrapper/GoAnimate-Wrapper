/**
 * @type {{[ip:string]:string}}
 */
var caché = {};
module.exports = {
	set(data, ip) {
		console.log('Session Adding.');
		caché[ip] = data;
		console.log(ip);
		console.log(data);
	},
	get(ip) {
		return caché[ip];
	},
	remove(ip) {
		console.log('Session Removing.');
		console.log(ip);
		console.log(caché[ip]);
		delete caché[ip];
	},
}