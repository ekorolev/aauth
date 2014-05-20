
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
	// Разбираем присланные данные по переменным.
	var app = options.app;
	var mongoose = options.mongoose;
	var userSchema = options.userSchema;

	// Готовим модель пользователя для нашего модуля.
	var Users = require('./lib/model')(mongoose, userSchema);

	// Переопределяем функции app.get, app.post, app.all
	app.aget = function (route, callback, roles) {
		app.get(route, function (req, res) {
			check(req, res, callback, roles);
		})
	}
	app.apost = function ( route, callback, roles ) {
		app.post(route, function (req, res) {
			check(req, res, callback, roles);
		})
	}
	app.aall = function ( route, callback, roles ) {
		app.all( route, function (req, res) {
			check( req, res, callback, roles );
		})
	}

	// Настраиваем приложения, устанавливаем пути модуля и прослойки модуля.
	app.all('/auth/:type', hundler);
	app.use( middleware );

	// Готовим логику модуля для работы
	var auth = require('./lib/auth')({
		Users: Users,
		social: options.social || {}
	});

	/*
		Обработчик запроса.
			- Получает запрос, определяет тип, передает соответственно типу в 
			дальнейшую обработку. Результат переваривает и отдает пользователю.
	*/
	function hundler ( req, res ) {
		var type = req.params.type;
		if ( auth[type] ) {
			auth[type](req, function (e, r) {
				if (e) { 
					res.send({error: e});
				} else if ( r.redirect ) {
					res.redirect( r.redirect );
				} else {
					res.redirect('/');
				}
			});
		}
	}

	/*
		Прослойка.
			- Передача необходимых данных в локальное представление.
	*/
	function middleware(req, res, next) {
		if ( req.session.auth ) {
			res.locals.auth = true;
			res.locals.user = req.session.user;
		} else {
			res.locals.auth = false;
		}
		next();
	}

	return {
		auth: auth,
		middleware: middleware
	}

	// Функция проверки доступа к роутам.
	function check ( req, res, callback, roles ) {
		var a = req.session.auth;
		var u = req.session.user;

		var no = function () {
			res.send('Доступ закрыт');
		}
		var yes = function () {
			callback( req, res ); 
		}

		// Если список ролей не указан, значит просто проверяем, авторизована ли сессия
		if ( !roles ) {
			if (a) yes(); else no();
		} else {
			// Если роль пользователя входит в массив допустимых ролей - пустим его.
			if ( roles.indexOf( user.role )+1 ) {
				yes();
			} else {
				no();
			}
		}
	}
}