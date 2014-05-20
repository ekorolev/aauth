
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
			login: String
		})
	}
	// Если нет пароля
	if ( !usersSchema.paths.password ) {
		usersSchema.add({
			password: String
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