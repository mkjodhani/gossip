var socket = new io();

socket.on('makeGUI',(userInfo) =>
{
    var {username,firstName,lastName,profilePic}  = userInfo;
    document.getElementById('myname').textContent = firstName +" "+ lastName;
    document.getElementById('myusername').textContent = username;
    document.getElementById('statusBorder').src = profilePic;
});
socket.on('receiveMessage',(message) =>
{
    addMessage(message,'received');
});
socket.on('receiveStatus',(data) =>
{
    var usr = data.username;
    var ele = document.getElementById(usr+"_Status");
    if(ele){
        ele.classList.replace(ele.classList[1],data.changedStatus);
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
    for(index in chat.messages){
        const type = me === chat.messages[index].from?'sent':'received';
        addMessage(chat.messages[index],type);
    }
})

