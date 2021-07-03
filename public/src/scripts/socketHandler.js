var socket = new io();

socket.on('makeGUI',(userInfo) =>
{
    console.log("making GUI")
    console.log(userInfo);;
    var {username,firstName,lastName,profilePic}  = userInfo;
    document.getElementById('myname').textContent = firstName +" "+ lastName;
    document.getElementById('statusBorder').src = profilePic;
});
socket.on('receiveMessage',(message) =>
{
    addMessage(message.payload,'received');
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
    console.log("receiveContacts::::::"+JSON.stringify(data));
    for(var i in data)
    {
        addContact(data[i]);
    }
});
socket.on('receiveRequests',(data)=>
{
    console.log("receiveRequests:::::::"+JSON.stringify(data));
    for(var i in data)
    {
        console.log(data[i]);
        addRequest(data[i]);
    }
});
socket.on('receivePeople',data=>{
    console.log("receivePeople::::::::"+JSON.stringify(data));
    for(var i in data)
    {
        console.log("adding person into ledger:::" + data[i]);
        addPerson(data[i]);
    }
})

