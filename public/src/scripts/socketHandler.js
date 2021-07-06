var socket = new io();
socket.on('makeGUI',(userInfo) =>
{
    makeProfile(userInfo);
});
socket.on('receiveMessage',(message) =>
{
    if(fetchedHistory[message.from]){
        fetchedHistory[message.from].messages.push(message);
        addMessage(message,'received');
    }
    else{
        const contact = document.getElementById(message.from +"_Contact");
        contact.style.backgroundColor = 'green'    
    }
});
socket.on('receiveStatus',(data) =>
{
    var usr = data.username;
    var ele = document.getElementById(usr+"_Status");
    if(ele){
        ele.classList.replace(ele.classList[1],data.status);
    }
})
socket.on('receiveContacts',(data) => 
{
    for(var i in data)
    {
        addContact(data[i]);
    }
});
socket.on('receiveRequests',(data)=>
{
    for(var i in data)
    {
        addRequest(data[i]);
    }
});
socket.on('receivePeople',data=>{
    for(var i in data)
    {
        addPerson(data[i]);
    }
})

socket.on('recieveHistory',chat=>{
    const me = document.getElementById('myusername').innerHTML;
    InsertsChat(chat,me);
    fetchedHistory[me === chat.user?chat.friend:chat.user] = chat;
})

