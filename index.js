
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

	// Настраиваем приложения, устанавливаем пути модуля и прослойки модуля.
	app.all('/auth/:type', hundler);
	app.use( middleware );

	// Готовим логику модуля для работы
	var auth = require('./lib/auth')(Users);

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
				} else if ( r.data ) {
					res.send( r.data );
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

}