const express = require('express')
const ejsLint = require('ejs-lint');
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)


app.set('views','./views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended :true}))

const groups = {}

app.get('/',(req,res)=>{
    res.render('index', {groups:groups})
})

app.post('/group',(req,res)=>{
    if(groups[req.body.group] !=null){
        return res.redirect('/')
    }
    groups[req.body.group] = {users:{}}
    res.redirect(req.body.group)
    // send message that group was created
    io.emit('group:created',req.body.group)
})

app.get('/:group',(req,res)=>{
    if(groups[req.params.group]==null){
        res.redirect('/')
    }
    res.render('group',{groupName:req.params.group })
})

server.listen(3000)

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