#AAuth#

##Быстрое подключение##

###app.js###
	
	var aauth = require('aauth');
	var express = require('express');
	var session = require('express-session');
	var bodyParser = require('body-parser');
	var cookieParser = require('cookie-parser');
	var mongoose = require('mongoose')('mongodb://localhost/sometext');

	var app = express();

	app.use( bodyParser() );
	app.use( cookieParser() );
	app.use( session({ secret: 'your secret' }) ); 

	aauth({
		app: app,
		mongoose: mongoose
	})

	app.get('/', function (req, res) {
		if (req.session.auth) {
			res.send('Вы авторизованы');
		} else {
			res.send('Вы не авторизованы');
		}
	})

	app.listen(80);

###Роуты###

	POST /auth/reg Регистрация. Передаем параметры login и password, получаем либо регистрацию, либо ошибку.

	POST /auth/password Вход. Передаем параметры login и password, получаем либо авторизацию, либо ошибку.

	GET /auth/twitter Авторизация через twitter
	
##Ответы функций модуля##

Ответ приходит в виде объекта. В случае ошибки, в объекте будет свойство error. Если ошибки не было, то либо свойство msg, в котором обозначен код ответа, либо свойство redirect с ссылкой, куда перенаправить пользователя.

###Коды ответа###

* 001.SUCCEEDED_REGISTRATION - Регистрация успешно завершена.
* 002.DATABASE_ERROR - Ошибка базы данных ( свойство details - детали ошибка база данных от mongoose )
* 003.INCORRECT_LOGIN_OR_PASSWORD - Неправильный логин или пароль.
* 004.INCORRECT_USER_TYPE - Неправильный тип пользователя. Это значит, что зайти в аккаунт запрашиваемого пользователя через пароль нельзя.
* 005.SUCCESSFUL_AUTHORIZATION - Успешная авторизация. 
* 006.SUCCESSFUL_EXIT - Успешная очистка сессии.
* 007.REDIRECT - Этот код означает, что в объекте есть поле redirect, в котором содержится ссылка, по которой нужно перенаправить пользователя.
* 008.TWITTER_ERROR - Ошибка ответа от twitter'а. Подробнее можно узнать в поле details.
* 009.SESSION_ERROR - Ошибка сессии. Это означает, что в сессии отсутствуют нужные для работы модуля параметры.
* 010.FACEBOOK_ERROR - Ошибка ответа от facebook. Подробнее - в поле details
