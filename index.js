
/*
	Модуль поддержки авторизации на сайте.
	Входные данные для установки модуля в проект:
	{
		model: Модель пользователя, основанный на mongoose.
			У этой модели должен быть login и password - обязательно. Это
			поля, через которые работает модуль.
		app: Ваше express приложение. Для вашего приложения будут созданы роуты
				регистрации и авторизации.
	}

	Модуль создает роуты: 
		POST /auth/password - post-запрос с login и password. 
		POST /auth/reg - регистрация login и password

*/

module.exports = function ( options ) {
	var app = options.app;
	var Users = options.model;

	app.all('/auth/:type', hundler);
	app.use( middleware );

	var auth = {
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
			var error = new Error('Неверный логин или пароль');

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

	function hundler ( req, res ) {
		var type = req.params.type;
		if ( auth[type] ) {
			auth[type](req, function (e, r) {
				if (e) { 
					res.send({error: e});
				} else if ( r.redirect ) {
					res.redirect( r.redirect );
				} else if ( r.data ) {
					res.send( r.data );
				}
			});
		}
	}

	function middleware(req, res, next) {
		if ( req.session.auth ) {
			res.locals.auth = true;
			res.locals.user = req.session.user;
		} else {
			res.locals.auth = false;
		}
		next();
	}

}