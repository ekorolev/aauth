var express = require('express');
var aauth = require('../index');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs-locals');
var mongoose = require('mongoose').connect('mongodb://localhost/aauth');

var app = express ();

app.engine('ejs', ejs);
app.set('view engine', 'ejs');
app.use( express.static( __dirname + '/public') );
app.use( bodyParser() );
app.use( cookieParser() );
app.use( session({ secret: 'okokdada' }) );

aauth({
	app: app,
	mongoose: mongoose,
	social: {
		twitter: {
			key: "hc2xAWeIIhxhI23VlfS1ql6B3",
			secret: "S4hxp7et3bv1urFRWKsszjOnooT6RSxhJOk4vTTsqUUjpy2ygq"
		}
	}
});

app.get('/', function (req, res) {
	res.render('index');
});

app.listen(9091);