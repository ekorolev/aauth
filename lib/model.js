
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
		},
		password: String,
		social_auth: { type: Array, default: [] },
		email: { type: String, unique: true },
		new_email: { type: String, unique: true },
		email_verify: { type: Boolean, default: false },
		email_verify_code: String,

		reg_type: String,
	})

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

	// Проверяем, чтобы емайлы не повторялись.
	usersSchema.pre('save', function (next) {
		var self = this;
		if ( self.isNew && self.reg_type == 'reg_page' ) {
			if ( !self.email ) {
				next(new Error("EMPTY_EMAIL"));
			} else {
				Users.findOne({ email: self.email }, function (e, user) {
					if (user) {
						next( new Error("THIS_EMAIL_EXISTS") );
					} else {
						next();
					}
				})
			}
		}
	})

	return Users;
}