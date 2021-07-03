const express = require('express')
const morgan = require('morgan')
const http = require('http');
const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);
// const session  =require('express-session')
// const FileStore = require('session-file-store')(session)
const hostname = "localhost"
const port = 6563;
const {Users,Sockets,Messages,Chats,Histories,Friends}  = require('./models/models')
const usersRouter = require('./routes/users') 
const Authenticate = require('./routes/auth');
app.use(morgan('tiny'));
app.use('/user',usersRouter);
app.use(express.static(__dirname+ "/public"))
io.on('connect',(socket) =>
{

    socket.on('disconnect',()=>
    {
        Sockets.findOneAndUpdate({"socketID":socket.id},
        {
            $set:{socketID:"None",active:false}
        },{new:true})
        .then(result =>
        {
            socket.broadcast.emit('receiveStatus',{
                username:result.username,
                changedStatus:"offline"
            });
        })
        .catch(err => console.log(err));
    });
    socket.on("newLogin",async (user) =>
    {
        await Sockets.findOneAndUpdate({username:user},{
            $set:{socketID:socket.id,active:true}
        })
        socket.broadcast.emit('receiveStatus',{
            username:user,
            changedStatus:"online"
        });
        
        (async function(){
            var friendList = await Friends.findOne({"username":user});
            var requestList = await Friends.findOne({"username":user});
            var userInfo =  await Users.findOne({"username":user});
            var peopleList =await Users.find({});
            peopleList = await  peopleList.map(person => person.username).filter(p => [...friendList.friends].indexOf(p) == -1 && p != user);
            if(friendList)
            {
                socket.emit('makeGUI',userInfo);
                socket.emit('receiveContacts',friendList.friends);
                socket.emit('receiveRequests',requestList.requests);
                socket.emit('receivePeople',peopleList);
            }
        })();
    });
    socket.on('sendMessage', async (message) =>
    {
        const historyTo = await Histories.findOne({username:message.to}).populate({path:'histories',select:'username messages'});
        const historyFrom = await Histories.findOne({username:message.from}).populate({path:'histories',select:'username messages'});
        
        var chatTo = await Histories.findOne({username:message.to}).populate({path:'histories',select:'user friend historyID'});
        var chatFrom =  await Histories.findOne({username:message.from}).populate({path:'histories',select:'user friend historyID'});
        
        var chatToId = await Chats.findOne({$and:[{user : message.from},  {friend : message.to}]});
        var chatFromId = await Chats.findOne({$and:[{user : message.to},  {friend : message.from}]});

        // MAKE NEW CHAT IN DATABASE IF NOT EXIXTS
        if(!chatToId && !chatFromId ){
            chatTo = Chats({user:message.to, friend:message.from});
            chatTo.historyID = historyFrom._id;
            await chatTo.save();
            historyFrom.history.push(chatTo);
            
            chatFrom = Chats({user:message.from, friend:message.to});
            chatFrom.historyID = historyTo._id;
            await chatFrom.save();
            historyTo.history.push(chatFrom);
        }
        else{
            chatTo = await Chats.findById({_id:chatToId._id});
            chatFrom = await Chats.findById({_id:chatFromId._id});
        }
        // STORE MESSAGE OBJ IN DATABASE
        const msgTo = Messages({...message});
        msgTo.chatID = chatTo._id;
        const msgFrom = Messages({...message});
        msgFrom.chatID = chatFrom._id;
        
        // LINKING MESSAGES TO CHATS
        await msgTo.save();
        await msgFrom.save();

        chatTo.messages.push(msgTo);
        chatFrom.messages.push(msgFrom);
        
        // SAVING ALL THE CHANGES TO DATABASE
        await chatTo.save();
        await chatFrom.save();
        await historyTo.save();
        await historyFrom.save();
        
        socket.broadcast.emit('receiveMessage',message);
    })
    
    socket.on('sendStatus',(status)=>
    {
        socket.broadcast.emit('receiveStatus',status);
    });
    socket.on('sendReq',frndReqest=>{

        Friends.findOneAndUpdate({"username":frndReqest.to},{
            $addToSet:{
            requests:frndReqest.from
            }
        },{new:true})
        .then(result=>
        {
            Sockets.findOne({username:frndReqest.to}).select({socketID:1}).then(res=>{
                if(res.socketID != "None")
                    io.to(res.socketID).emit('receiveRequests',[frndReqest.from]);
            });
        });
    })
    socket.on('fetchHistory', async (payload) => {
        var chat = await Chats.findOne({$and:[{user : payload.user},  {friend : payload.friend}]})
        .populate({
            path:'messages',
            select:'to from payload type timeStamp'
        });
        socket.emit('recieveHistory',chat);
    })
    socket.on('acceptReq',async (frndReqest)=>{
        await Friends.findOneAndUpdate({"username":frndReqest.from},{
            $addToSet:{
            friends:frndReqest.to
            }
        },{new:true});
        Friends.findOneAndUpdate({"username":frndReqest.to},{
            $addToSet:{
            friends:frndReqest.from
            }
        },{new:true})
        .then(result=>
        {
            // Add person to the conatact list of both parties...
            Sockets.findOne({username:frndReqest.to}).select({socketID:1}).then(res=>{
                if(res.socketID != "None")
                    io.to(res.socketID).emit('receiveContacts',[frndReqest.from]);
            });
            
            Sockets.findOne({username:frndReqest.from}).select({socketID:1}).then(res=>{
                if(res.socketID != "None")
                    io.to(res.socketID).emit('receiveContacts',[frndReqest.to]);
            });
        });
    });
})


server.listen(6563,()=>
{
    console.log(`Server is listening at ${hostname}:${port}....`);
    console.log(`click following link \n>>> http://${hostname}:${port}/chat/chat.html`);
})