

module.exports = function (opts) {
	var keys = opts.keys;
	var Users = opts.Users;
	var log = require('./login');

	return function (req, callback) {
		var conf = {
			key: keys.id,
			secret: keys.secret
		}
		var OAuth = require('oauth').OAuth;
		var oauth = new OAuth(
	 	  'https://api.twitter.com/oauth/request_token',
	 	  'https://api.twitter.com/oauth/access_token',
	 	  conf.key,
	 	  conf.secret,
	 	  '1.0',
	 	  'http://'+req.headers.host+'/auth/twitter?callback=true',
	 	  'HMAC-SHA1'
		);
		if ( !req.query.callback ) {
			console.log('-> Инициирована авторизация через Twitter.');
		  oauth.getOAuthRequestToken( function (error, oauth_token, oauth_token_secret, results) {
		    if (error) {
		    	callback({ code: "008", error: "TWITTER_ERROR", details: error });
		    } else {
		      req.session.oauth = {
		        token: oauth_token,
		        token_secret: oauth_token_secret
		      };
		      callback({ code: "007", redirect: 'https://twitter.com/oauth/authenticate?oauth_token='+oauth_token } );
		    }
		  });
		} else {
			if ( req.session.oauth ) {
		    req.session.oauth.verifier = req.query.oauth_verifier;
		    var oauth_data = req.session.oauth;
		 
		    oauth.getOAuthAccessToken(
		      oauth_data.token,
		      oauth_data.token_secret,
		      oauth_data.verifier,
		      function (error, oauth_access_token, oauth_access_token_secret, results) {
		        if (error) {
		        	callback({ error: error });
		        }
		        else {
		          req.session.oauth.access_token = oauth_access_token;
		          req.session.oauth.access_token_secret = oauth_access_token_secret;

		          Users.findOne({ social_auth: 'twitter'+results.user_id }, function (err, user) {
		          	console.log(user);
		          	if (user) {
		          		// Если пользователь найден, то просто авторизуем его АХАХАХАХАХА
		          		log.in({ req: req, user: user });
		          		callback({ code: "005", msg: "SUCCESSFUL_AUTHORIZATION" });
		          	} else {
		          		// Если пользователь не найден и не было ошибок, значит
		          		// такого пользователя в базе нет. Создаем его
		          		if (!err) {
		          			var user = new Users({
		          				login: results.screen_name,
		          				social_auth: [
		          					'twitter'+results.user_id
		          				]
		          			});
		          			user.save( function (err, user) {
		          				if ( err ) {
		          					callback({ code: "002", error: 'DATABASE_ERROR' , details: err });
		          				} else {
		          					log.in({ req: req, user: user });
		          					callback({ code: "005", msg: "SUCCESSFUL_AUTHORIZATION" });
		          				}
		          			})
		          		} else {
		          			callback({ code: "002", error: 'DATABASE_ERROR' , details: err });
		          		}
		          	}
		          })
		        }
		      }
		    );
			} else {
				callback({ code: "009", error: 'SESSION_ERROR' });
			}
		}
	}
}