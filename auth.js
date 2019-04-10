var User = require('./models/User.js')
var jwt = require('jwt-simple')
var bcrypt = require('bcrypt-nodejs')
var express = require('express')
var router = express.Router()

var auth = {
    router,
    checkAuthenticated: (req, res, next) => {
        if (!req.header('authorization'))
            return res.staus(401).send({ message: 'missing authorization header' })
        var token = req.header('authorization').split(' ')[1]
        var payload = jwt.decode(token, 'secret123')
        if (!payload)
            return res.staus(401).send({ message: 'auth header invalid' })
        req.userId = payload.sub
        next()
    }
}

router.post('/register', async (req, res) => {
    // console.log('ok, req is ', req)
    var userData = req.body
    if(userData.email === 'rcraven85@gmail.com') userData.admin = true; 
    var userExists = await User.findOne({ email: userData.email })
    if(userExists)
        return res.status(418).send({message: 'user already exists'})
    console.log('yoo, userData is ', userData)
    var user = new User(userData)
    // if(userData.favorite_books.length){
    //     for(var i = 0; i < userData.favorite_books.length; i++){
    //         var title = userData.favorite_books[i]
    //         var book = new Book({title})
    //         book.save((err, newBook) => {
    //             user.favorite_books.push(newBook)
    //         })
    //     }
    // }
    user.save((err, newUser) => {
        // console.log('newUser fav book arr is ', newUser.favorite_books)
        if (err)
            return res.status(500).send({ message: 'Invalid email or password' })

        createSendToken(res, newUser)
    })
})

router.post('/login', async (req, res) => {    
    var loginData = req.body
    var user = await User.findOne({ email: loginData.email })

    if (!user)
        return res.status(401).send({ message: 'This user does not exist' })
    bcrypt.compare(loginData.pwd, user.pwd, (err, isMatch) => {
        if (!isMatch)
            return res.status(401).send({ message: 'Invalid password' })

        createSendToken(res, user)
    })
})

router.post('/checkAdmin', auth.checkAuthenticated, async (req, res) => {  
    var user = await User.findOne({ _id: req.userId })
    if(!user) return
    console.log('about to check')
    // console.log(ObjectId(user._id).getTimestamp())
    // console.log(user._id.getTimestamp())
    // console.log(user._id.getTimestamp().toUTCString())

    var now = new Date();
    var utc = new Date(now.getTime()).toISOString();
    console.log(utc)
    // console.log('mustasche: ', utc.toISOString())


    User.update({_id: user._id}, {
        last_active: utc
    }, function(err, numberAffected, rawResponse) {
       //handle it
    //    console.log('number affected: ', numberAffected)
    })
    //the following should be moved to server.js at some point for refactor
    // var user = await User.findById(req.params.id, '-pwd -__v')
    var friend_list = await User.find({_id: {$in : user.friends}})
    var inbound_friend_requests = await User.find({_id: {$in : user.inbound_friend_requests}})
    var outbound_friend_requests = await User.find({_id: {$in : user.outbound_friend_requests}})
    user.friends = friend_list
    user.outbound_friend_requests = outbound_friend_requests
    user.inbound_friend_requests = inbound_friend_requests
    
    // i dont think this is necessary
    if(user.admin){
        res.status(200).send({ admin : true, user})
    } else {
        res.status(200).send({ admin : false, user}) 
    };
})
router.post('/checkId', auth.checkAuthenticated, async (req, res) => {  
    // console.log('in CHECKID, userId is ', req.userId)
    // var user = await User.findOne({ _id: req.userId })
    // if(!user) return
    // if(user.admin){
    //     res.status(200).send({ admin : true, user_id: req.userId})
    // } else {
    //     res.status(200).send({ admin : false, user_id: req.userId}) 
    // };
})

function createSendToken(res, user){
    // console.log('lets see if this worksssssssss', user)
    var payload = {sub: user._id}
    var token = jwt.encode(payload, 'secret123')
    if(user.admin){
        res.status(200).send({token, user})
    } else {
        res.status(200).send({ token, user })
    }
}

module.exports = auth