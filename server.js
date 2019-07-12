const _ = require('lodash')
const express = require('express')
const app = express()
const {User} = require('./public/users')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const mongoose = require('./db/mongoose.js')

app.set('views','./views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.static('views'))
app.use(express.urlencoded({extended :true}))

const groups = {}

mongoose.Promise=global.Promise

// sending to home page for the users choice

app.get('/',(req,res)=>{
    res.render('home')
})

//sending to index page after home page

app.post('/route',(req,res)=>{
    res.render('index',{groups:groups})
})

// sending to the sign-in page

app.post('/sign-in',(req,res)=>{
    res.render('login')
})

// Registration of the group

app.post('/Register', (req, res) => {
    var data = new User(req.body)
    data.save().then(() => {
        console.log('data saved')
        groups[req.body.group] = {users:{}}
        res.redirect(req.body.group)
    }).catch((e) => {
        res.status(404).send(e)
    })
})

// Login page

app.post('/login', (req,res) => {
    var data = _.pick(req.body, ['group', 'password'])
    User.findByinput(data.group, data.password).then((user) => {
        groups[req.body.group] = {users:{}}
        res.redirect(req.body.group)
        io.emit('group:joined',req.body.group)
    }).catch((e) => {
        res.send('Invalid credentials')
    })
})

// group's page where chat is started after registration

app.post('/group',(req,res)=>{
    if(groups[req.body.group] !=null){
        return res.redirect('/')
    }
    groups[req.body.group] = {users:{}}
    res.redirect(req.body.group)
    // send message that the group was created
    io.emit('group:created',req.body.group)
})

// particular chat group which the user has joined after logging in

app.get('/:group',(req,res)=>{
    if(groups[req.params.group]==null){
        res.redirect('/')
    }
    res.render('group', { groupName: req.params.group })
})

// server connection on port 3000

server.listen(process.env.PORT || 3000)

// connection with the client

io.on('connection', socket=>{
    socket.on('new-user',(group, name) => {
        socket.join(group)
        groups[group].users[socket.id] = name
        socket.to(group).broadcast.emit('user-connected', name)
      })
    socket.on('send-chat-message', (group,message) =>{
        socket.to(group).broadcast.emit('chat-message',{message:message,name:groups[group].users[socket.id]})
    })
    socket.on('disconnect', () => {
        getUserGroups(socket).forEach(group=>{
            socket.to(group).broadcast.emit('user-disconnected', groups[group].users[socket.id])
            delete groups[group].users[socket.id]
        })
    })
})

function getUserGroups(socket){
    return Object.entries(groups).reduce((names, [name,group])=>{
        if(group.users[socket.id] != null) names.push(name)
        return names
    },[])
}