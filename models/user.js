 var mongoose = require('mongoose');
 var Schema  = mongoose.Schema;
 var passportLocalMongoose = require('passport-local-mongoose');

 var User = new Schema({  // here var User => is the new schema and we can write it as UserSchema also

    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
 });

User.plugin(passportLocalMongoose);

 module.exports = mongoose.model('User',User);