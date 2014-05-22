	
var module.exports = function ( opts ) {
	var Users = opts.Users;
	var keys = opts.keys;
	var log = require('./login');

	return function (req, callback) {
		var request = require('request');
		var qs = require('querystring');
		var CLIENT_ID = keys.id;
		var CLIENT_SECRET = keys.secret;

		if ( !req.query.callback ) {
			var redirect_url = 
					'https://facebook.com/dialog/oauth?client_id='
						+CLIENT_ID+
					'&redirect_uri=http://'
					+req.headers.host+
					'/auth/facebook?callback=true&response_type=code';
			callback({ code: "007", redirect: redirect_url });
		} else {
			if ( !req.query.access_token ) {
				var url = 'https://graph.facebook.com/oauth/access_token?client_id='
									+CLIENT_ID+
									'&redirect_uri=http://'
									+req.headers.host+
									'/auth/facebook?callback=true&client_secret='
									+CLIENT_SECRET+
									'&code='
									+req.query.code;
				request(url, function (e, r, b) {
					b = qs.parse(b);
					var url = 'https://graph.facebook.com/me?access_token='+b.access_token;
					request(url, function (e, r, b) {
						b = JSON.parse(b);
						if (e) {
							callback({ code: "010", error: 'FACEBOOK_ERROR', details: e });
						} else {
							Users.findOne({ auth: 'facebook' + b.id }, function (err, user) {
								if (!user&&!err) {
									user = new Users({
										name: b.name,
										auth: 'facebook' + b.id
									});
									user.save( function (err, user) {
										if (err) callback({ code: "002", error: 'DATABASE_ERROR', details: err });
										if (!err) {
											log.in({ req: req, user: user, social: true });
		          		callback({ code: "005", msg: "SUCCESSFUL_AUTHORIZATION" });
										}
									})
								} else {
									log.in({ req: req, user: user, social: true });
		          		callback({ code: "005", msg: "SUCCESSFUL_AUTHORIZATION" });
								}
							})
						}

					})			
				})
			}
		}
	}
}