const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
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
    chatID:{
        type:Schema.Types.ObjectId,
        ref:'Chat'
    },
    timeStamp:
    {
        type:Date,
        default:Date.now
    }
});
    
const chatSchema = new Schema({
    user:{
        type:String,
        required:true,
    },
    friend:{
        type:String,
        required:true,
    },
    messages: [{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'Message'
    }],
    historyID:{
        type:Schema.Types.ObjectId,
        ref:'History'
    } 
});

chatSchema.virtual('chats',{
    ref:'Message',
    localField: '_id', 
    foreignField: 'chatID'
});
chatSchema.set('toObject', { virtuals: true });
chatSchema.set('toJSON', { virtuals: true });

const historySchema = new Schema(
{
    username:{
        type:String,
        required:true
    },
    history:[{
            type:Schema.Types.ObjectId,
            ref:'Chat',
            required:true
    }]
},
{
    timestamps:true
});

historySchema.virtual('histories',{
    ref:'Chat',
    localField: '_id', 
    foreignField: 'historyID'
});
historySchema.set('toObject', { virtuals: true });
historySchema.set('toJSON', { virtuals: true });

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
    
const statusSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    status:{
        type:String,
        required:true,
    }
});
exports.Users = mongoose.model('User',userSchema);
exports.Sockets = mongoose.model('Socket',socketSchema);
exports.Messages = mongoose.model('Message',messageSchema);
exports.Chats = mongoose.model('Chat',chatSchema);
exports.Histories = mongoose.model('History',historySchema);
exports.Friends = mongoose.model('friend',friendSchema);
exports.Status = mongoose.model('Status',statusSchema);