var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')

// var childSchema = new Schema({ friend: 'string' });

// var friend = new mongoose.Schema({
//     name: String,
//     original_id: String
// })

var userSchema = new mongoose.Schema({
    name: String,
    email: String,
    pwd: String,
    description: String,
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    outbound_friend_requests:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
    }],
    inbound_friend_requests:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
    }],
    admin: Boolean,
    created_date: { type: Date, default: Date.now },
    last_active: {type: Date, default: Date.now("<YYYY-mm-ddTHH:MM:ss>")},
    // favorite_books:[{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Book'  
    // }],
    queued_books:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'  
    }],
    finished_books:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'  
    }],
    reviewed_books:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'  
    }],
    reviews:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'  
    }]
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