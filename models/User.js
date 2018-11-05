var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')

var userSchema = new mongoose.Schema({
    name: String,
    email: String,
    pwd: String,
    description: String
})

userSchema.pre('save', function(next) {
    var user = this

    if(!user.isModified('pwd'))
        return next()
    // bcrypt.hash(1st param: thingbeing hashed, 
    // 2nd param: salt which allows randomizing the hash (null tells bcrypt to auto generate a salt), 
    // 3rd param: progresscallback which lets us know the progress of our hash generation,
    // 4th param: completed callback)
    bcrypt.hash(user.pwd, null, null, (err, hash) => {
        console.log(hash);
        if(err) return next(err)

        user.pwd = hash
        next()
    })    
})

module.exports = mongoose.model('User', userSchema)