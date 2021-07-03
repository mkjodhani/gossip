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
            // console.log(result.username + "logged out....");
            socket.broadcast.emit('receiveStatus',{
                username:result.username,
                changedStatus:"offline"
            });
        })
        .catch(err => console.log(err));
    });
    socket.on("newLogin",(user) =>
    {
        Sockets.findOneAndUpdate({username:user},{
            $set:{socketID:socket.id,active:true}
        }).then((data) =>
        {
            console.log(`USER: ${data}  socket allocation finished`);
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
            /*
            peopleList = peopleList.map(person => person.username);
            peopleList = peopleList.filter(person =>friendList.friends.indexof(person) == -1)*/
            if(friendList)
            {
                socket.emit('makeGUI',userInfo);
                socket.emit('receiveContacts',friendList.friends);
                socket.emit('receiveRequests',requestList.requests);
                socket.emit('receivePeople',peopleList);
            }
            /*
            console.log("friendList to user",friendList.friends);
            console.log("requestList to user",requestList.requests);
            console.log("peopleList to user",peopleList);
            console.log("Sendingself to user",userInfo);
            */
        })();
    });
    socket.on('sendMessage', async (message) =>
    {
        // console.log(message);
        const msg = Messages({...message});
        const result = await Histories.findOne({$and:[{"username":message.to},{"history.username":message.from}]});
        if(!result)
        {
            const chat = Chats({username:message.from,messages:[msg]});
            await Histories.findOneAndUpdate({"username":message.to},{$push:{
                "history":chat
            }})
        }
        else
        {
            // const obj =  await Histories.findOne({$and:[{"username":message.to},{"history.username":message.from}]});
            // obj.history.filter(h => h.username == message.from )[0].messages.push(msg);
            // obj.save(done);
            console.log("------------------------PUSHED------------------------");
        }
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
                console.log("Rsult FRMO receiveRequests " , res);
                if(res.socketID != "None")
                    io.to(res.socketID).emit('receiveRequests',[frndReqest]);
            });
            console.log("MAIN RESULT",result);
        });
    })
    socket.on('acceptReq',frndReqest=>{
        Friends.findOneAndUpdate({"username":frndReqest.from},{
            $addToSet:{
            friends:frndReqest.to
            }
        },{new:true})
        .then(data =>
        {
            console.log("Request accepted one side...");
        });
        Friends.findOneAndUpdate({"username":frndReqest.to},{
            $addToSet:{
            friends:frndReqest.from
            }
        },{new:true})
        .then(result=>
        {
            console.log("Request accepted other side...");
            // Add person to the conatact list of both parties...
            Sockets.findOne({username:frndReqest.to}).select({socketID:1}).then(res=>{
                console.log("Rsult FRMO acceptReq" , res);
                if(res.socketID != "None")
                    io.to(res.socketID).emit('receiveContacts',[frndReqest.from]);
            });
            
            Sockets.findOne({username:frndReqest.from}).select({socketID:1}).then(res=>{
                console.log("Rsult FRMO acceptReq" , res);
                if(res.socketID != "None")
                    io.to(res.socketID).emit('receiveContacts',[frndReqest.to]);
            });
            console.log("MAIN RESULT",result);
        });
    });
    /*
    socket.on('',frndReqest=>{
        Friends.findOneAndUpdate({"username":frndReqest.to},{
            $addToSet:{
            requests:frndReqest.from
            }
        },{new:true})
        .then(result=>
        {
            console.log(result);
        });
    })
    /*socket.on('changeStatus',status)
    {
        socket.broadcast.emit('userChangeStatus',status);
    }*/
    console.log("Socket is now connected");
    
})


server.listen(6563,()=>
{
    console.log(`Server is listening at ${hostname}:${port}....`);
    console.log(`click following link \n>>> http://${hostname}:${port}/chat/chat.html`);
})