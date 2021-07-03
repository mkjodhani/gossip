const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    firstName:
    {
        type:String,
        required:true,
    },
    lastName:
    {
        type:String,
        required:true,
    },
    password:
    {
        type:String,
        required:true,
    },
    profilePic:
    {
        type:String,
        default:"./src/img/friend-request(2).png"
    },
    about:{
        type:String,
        max:255,
        default:"Hey there! I am using Gossip!"
    }
},{
    timestamps:true
});

const socketSchema = new Schema({
    username:
    {
        type:String,
        required:true,
        unique:true
    },
    socketID:
    {
        type:String,
        required:true,
    },
    active:
    {
        type:Boolean,
        required:true
    }
},{
    timestamps:true
});

const messageSchema = new Schema({
    to:
    {
        type:String,
        required:true,
    },
    from:
    {
        type:String,
        required:true,
    },
    payload:
    {
        type:String,
        required:true,
    },
    type:
    {
        type:String,
        required:true,
    },
    source:{
        type:String,
        required:function (){
            return this.type != "text"
        }
    },
    timeStamp:
    {
        type:Date,
        default:Date.now
    }
});

const chatSchema = new Schema({
    username:{
        type:String,
        required:true,
    },
    messages: [messageSchema] 
});

const historySchema = new Schema(
{
    username:{
        type:String,
        required:true
    },
    history:{
        type:[chatSchema],
        default: []
    }
},
{
    timestamps:true
});


const friendSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    friends:{
        type:[String],
        default: []
    },
    requests:{
        type:[String],
        default:[]
    }
},
{
    timestamps:true
});
    
    
exports.Users = mongoose.model('User',userSchema);
exports.Sockets = mongoose.model('Socket',socketSchema);
exports.Messages = mongoose.model('Message',messageSchema);
exports.Chats = mongoose.model('Chat',chatSchema);
exports.Histories = mongoose.model('History',historySchema);
exports.Friends = mongoose.model('friend',friendSchema);