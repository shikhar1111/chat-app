const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const mongoose = require('mongoose')
var _ = require('lodash')
const {User} = require('./public/users')

mongoose.Promise=global.Promise;
// mongodb://shikhar:shikhar123@ds345587.mlab.com:45587/chat-app
// mongodb://localhost:27017/Chat-app

mongoose.connect('mongodb://localhost:27017/Chat-app',(e)=>{
  if(e){
   console.log("database not connected");
  }else{
   console.log("database connected");
  }
 });
 

app.set('views','./views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended :true}))

const groups = {}

app.post('/Register', (req, res) => {

    var data = new User(req.body);
    data.save().then(() => {
        console.log('data saved')
        groups[req.body.group] = {users:{}}
        res.redirect(req.body.group)
    }).catch((e) => {
        res.status(404).send(e)
    })

});


app.get('/',(req,res)=>{
    res.render('index', {groups:groups})
})

app.post('/group',(req,res)=>{
    if(groups[req.body.group] !=null){
        return res.redirect('/')
    }
    groups[req.body.group] = {users:{}}
    res.redirect(req.body.group)
    // send message that the group was created
    io.emit('group:created',req.body.group)
})
app.post('/sign-in',(req,res)=>{
    res.render('login')
})
app.post('/login', (req,res) => {

    var data = _.pick(req.body, ['group', 'password']);
    User.findByinput(data.group, data.password).then((user) => {
        // res.send(data);
        groups[req.body.group] = {users:{}}
        res.redirect(req.body.group)
        io.emit('group:joined',req.body.group)
    }).catch((e) => {
        res.send('Invalid credentials');
    })

});

app.get('/:group',(req,res)=>{
    if(groups[req.params.group]==null){
        res.redirect('/')
    }
    // res.render('group',{groupName:req.params.group })
    res.render('group', { groupName: req.params.group })
})

server.listen(process.env.PORT || 3000)

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