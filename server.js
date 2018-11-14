var express = require('express');
var cors = require('cors')
var app = express(); 
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var auth = require('./auth.js')
var jwt = require('jwt-simple')
// var posts = [
//     {message: 'hello'},
//     {message: 'bewbies'},
//     {},
//     {}
// ] 
 
var User = require('./models/User.js')
var Post = require('./models/Post.js')

mongoose.Promise = Promise

app.use(cors())
app.use(bodyParser.json())
 
// function checkAuthenticated(req, res, next){
//     if(!req.header('authorization'))
//         return res.staus(401).send({message: 'missing authorization header'})
    
//     var token = req.header('authorization').split(' ')[1]
//     console.log(token);
//     var payload = jwt.decode(token, 'secret123')
//     if(!payload)
//         return res.staus(401).send({ message: 'auth header invalid' })
//     req.userId = payload.sub

//     next()
// }

app.get('/posts/:id', async (req,res) => {
    // console.log('in get posts/id');
    
    var author = req.params.id
    // var author = '5bce83f2d45bfe4b3d507809'
    var posts = await Post.find({ author })
    res.send(posts)
    // } catch (error) {
    //     res.sendStatus(500)
    // }
    // res.sendStatus(200) 
})
app.post('/post', auth.checkAuthenticated, (req, res) => {
    var postData = req.body
    postData.author = req.userId;
    var post = new Post(postData)

    post.save((err, result) => {
        if(err){
            return res.status(500).send({message: 'saving post error'})
        }
        res.sendStatus(200)
    })
})
app.post('/add_connection', auth.checkAuthenticated, async (req, res) => {
    var userData = req.body
    var user = await User.findOne({ _id: req.userId })
    var newFriend = await User.find({ _id: userData.id })
    console.log('ahoy! newfriend is ', newFriend)
    if(user.friends.indexOf(userData.id.toString()) > -1){
        return res.status(501).send({ message: 'Already a friend!' })
    }
    if(user && newFriend)
        user.friends.push(userData.id)
        user.save()
})
app.post('/request_connection', auth.checkAuthenticated, async (req, res) => {
    var userData = req.body
    var user = await User.findOne({ _id: req.userId })
    var newFriend = await User.findOne({ _id: userData.id })
    console.log('ahoy! user is ', user, 'newfriend is ', newFriend)
    if(newFriend.friend_requests.indexOf(req.userId)>-1){
        return res.status(501).send({ message: 'Already requested!' })
    }
    if(user && newFriend)
        newFriend.friend_requests.push(user)
        newFriend.save()
        return res.status(200).send({message: 'Request sent'})
})
app.get('/users', async (req, res) => {
    try {
        var users = await User.find({}, '-pwd -__v')
        res.send(users)
    } catch(error){
        res.sendStatus(500)        
    }
})
app.get('/profile/:id', async(req, res) => {
    try {
        var user = await User.findById(req.params.id, '-pwd -__v')
        var friend_list = await User.find({_id: {$in : user.friends}})
        user.friends = friend_list
        res.send(user)
    } catch (error) {
        res.sendStatus(500)
    }  
})
// app.post('/register', auth.register)
// app.post('/login', auth.login)
mongoose.connect('mongodb://bookclub_masteruser:Kwalton33!@ds137703.mlab.com:37703/bookclub', {useNewUrlParser : true}, (err) =>{
    if(!err)
        console.log('connected to mongo');
        
})

app.use('/auth', auth.router)
app.listen(process.env.PORT || 3000) 