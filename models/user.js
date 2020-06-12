 var mongoose = require('mongoose');
 var Schema  = mongoose.Schema;

 var User = new Schema({  // here var User => is the new schema and we can write it as UserSchema also

    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }
 });

 module.exports = mongoose.model('User',User);