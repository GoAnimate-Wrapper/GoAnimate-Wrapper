/* Looking for a written form of the themes list?

"action"
"animal"
"anime"
"bizmodels"
"botdf"
"business"
"cc2"
"chibi"
"christmas"
"common"
"commoncraft"
"custom"
"family"
"infographics"
"monstermsh"
"ninja"
"ninjaanime"
"politic"
"politics2"
"retro"
"space"
"spacecitizen"
"startrek"
"stick"
"sticklybiz"
"toonadv"
"ugc"
"vietnam"
"whiteboard"
*/

const nodezip = require('node-zip');
const zippy = require('./zippy');

module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/getThemeList/') return;
	res.setHeader('Content-Type', 'application/zip');
	zippy('themes/themelist.xml', 'themelist.xml').then(b => res.end(b));
	return true;
}