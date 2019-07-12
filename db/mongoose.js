var mongoose=require('mongoose')

mongoose.Promise=global.Promise

// for local database
// mongodb://localhost:27017/Chat-app

// for mlab database
// mongodb://shikhar:shikhar123@ds345587.mlab.com:45587/chat-app

mongoose.connect('mongodb://localhost:27017/Chat-app',(e)=>{
    if(e){
        console.log("Database not connected")
    }else{
        console.log("Database connected")
    }
})

module.exports={mongoose}