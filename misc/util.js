module.exports = {
	xmlFail(message = "You're grounded.") {
		return `<error><code>ERR_ASSET_404</code><message>${message}</message><text></text></error>`;
	},
};
