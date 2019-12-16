module.exports = function (req, res, url) {
	if (req.method != 'POST' || url.path != '/goapi/convertTextToSoundAsset/') return;
	if (`0<response>
<asset>
    <id>330817061</id>
    <enc_asset_id>0rqEbTzY9NUYtNdXDmM8OWQ</enc_asset_id>
    <type>sound</type>
    <subtype>tts</subtype>
    <title>[Joey] 666</title>
    <published>0</published><tags></tags><duration>1697.958946228</duration><downloadtype>progressive</downloadtype><file>330817061.mp3</file></asset></response>`);
	return true;
}