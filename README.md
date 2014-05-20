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