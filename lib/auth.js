
module.exports = function (Users) {
	
	return {
		reg: function (req, cb) {
			var data = req.body;
			var user = new Users(req.body);
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

			Users.findOne({ login: login }, function (e, user) {
				if (e) cb(e); else {
					if (!user) { cb(error); } else {
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
}