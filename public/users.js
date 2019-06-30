const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    group:{
        type:String,
        required:true,
        trim:true,
        unique:true
    }
})

// for hashing the passswords
UserSchema.pre('save', function (next) {
    var user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(10, (err,sa) => {
            bcrypt.hash(user.password, sa, (err,hash) => {
                user.password = hash;
                next();
            });
        });
   }else{
       next();
   }
    });

    UserSchema.statics.findByinput = function(email, password){
        var user = this;
        return user.findOne({email}).then((user) => {
            if(!user){
                return Promise.reject();
            }

            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err,res) => {
                    if(res){
                        resolve(user);
                    }else{
                        reject();
                    }
                })
            });
        });
    };

    
var User = mongoose.model('User', UserSchema)

module.exports = {User}