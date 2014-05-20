
/*
	Функция приводит модель пользователя в приемлемый для модуля вид.

	Модель необходима иметь:
		- Поле login,
		- Поле password,
		- Метод хэширования пароля.
		- Метод проверки строки на соответствие паролю.
*/

var bcrypt = require('bcrypt');
module.exports = function ( mongoose, usersSchema ) {

	var Schema = mongoose.Schema;
	usersSchema = Schema(usersSchema || {} );

	// Если нет логина
	if ( !usersSchema.paths.login ) {
		usersSchema.add({
			login: {
				type: String,
				unique: true,
				required: true,
				validate: [
					{
						validator: function (l) { return l.length > 3 },
						msg: "SHORT_LOGIN"
					},
					{
						validator: function (l) { return l.length < 22 },
						msg: "LONG_LOGIN"
					}
				]
			}
		})
	}
	// Если нет пароля
	if ( !usersSchema.paths.password ) {
		usersSchema.add({
			password: {
				type: String,
				unique: false
			}
		})
	}
	// Должно быть поля social_auth для авторизации через соцки
	if ( !usersSchema.paths.social_auth ) {
		usersSchema.add({
			social_auth: {
				type: Array,
				default: []
			}
		})
	}

	usersSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
	};

	var Users = mongoose.model('users', usersSchema)

	usersSchema.pre('save', function (next) { 
	    if(this.password && this.password[0]!='$') {                                                                                                                                                        
	        var salt = bcrypt.genSaltSync(10);                                                                                                                                     
	        this.password  = bcrypt.hashSync(this.password, salt);                                                                                                                
	    }                                                                                                                                                                        
	    next();                                                                                                                                                                     
	});

	return Users;
}