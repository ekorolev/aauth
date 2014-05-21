
module.exports = function (options) {
	var Users = options.Users;
	
	var will_return = {
		reg: function (req, cb) {
			var data = req.body;
			var user = new Users(req.body);
			user.reg_type = 'reg_page'
			user.save( function (e, user) {
				if (e) cb(e); else {
					cb(null, {
						data: "Пользователь зарегистрирован!"
					})
				}
			})
		},

		password: function (req, cb) {
			var login = req.body.login;
			var password = req.body.password;
			var error = 'Неверный логин или пароль';

			Users.findOne({ $or: [ {login: login}, {email: login} ] }, function (e, user) {
				if (e) cb(e); else {
					if (!user) { cb(error); } else {
						// Если пользователь найден, но пароля у него нет - ошибка
						if ( !user.password ) { cb('PASSWORD_ERROR') } else {
							user.comparePassword( password, function (e, isMatch) {
								if (e) cb(e); else {
									if (!isMatch) {
										cb(error);
									} else {
										req.session.auth = true;
										req.session.user = user;
										cb(null, {
											data: "Пользователь авторизован"
										})
									}
								}
							})	
						}
					}
				}
			});
		},

		logout: function (req, cb) {
			req.session.user = false;
			req.session.auth = false;
			cb(null, {
				data: "Пользователь вышел"
			})
		}
	}

	var social = options.social;
	if ( social ) {
		if ( social.twitter ) {
			var twitter = social.twitter;
			will_return.twitter = require('./twitter')({
				keys: {
					id: twitter.key || twitter.id,
					secret: twitter.secret
				},
				Users: Users
			})
		}
		if ( social.facebook ) {
			var facebook = social.facebook;
			will_return.facebook = require('./facebook')({
				keys: {
					id: facebook.key || facebook.id,
					secret: facebook.secret
				},
				Users: Users
			});
		}
	}

	return will_return;
}