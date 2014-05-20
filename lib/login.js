exports.in = function ( req, user ) {
	req.session.user = user;
	req.session.auth = true;
}
exports.out = function (req, user) {
	req.session.user = false;
	req.session.auth = false;
}