// const socket = io('http://localhost:3000')
const socket = io('https://chat-app2019.herokuapp.com')

const messageContainer = document.getElementById('message-container')
const groupContainer = document.getElementById('group-container')
const messageform = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')



if(messageform !=null){
    const name = prompt('What is your name?')
appendMessage('You joined')
socket.emit('new-user',groupName, name)
    messageform.addEventListener('submit', e =>{
        e.preventDefault()
        const message = messageInput.value
        appendMessage(`${message}`)
        socket.emit('send-chat-message',groupName,message)
        messageInput.value = ''
    })
    
}

socket.on('group-created',group=>{
    const groupElement = document.createElement('div')
    groupElement.innerText = group
    const groupLink = document.createElement('a')
    groupLink.href = '/${group}'
    groupLink.innerText = 'Join'
    groupContainer.append(groupElement)
    groupContainer.append(groupLink)
})
socket.on('group-joined',group=>{
    const groupElement = document.createElement('div')
    groupElement.innerText = group
    const groupLink = document.createElement('a')
    groupLink.href = '/${group}'
    groupLink.innerText = 'Join'
    groupContainer.append(groupElement)
    groupContainer.append(groupLink)
})
socket.on('chat-message',data =>{
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
    appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`)
})

function appendMessage(message){
    const messageElement = document.createElement('div')
    messageElement.innerText = message
    messageContainer.append(messageElement)
}


