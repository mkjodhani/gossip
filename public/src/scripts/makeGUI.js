function makePerson(username)
{
    var person = document.createElement('div');
    person.classList.add('userBox');
    person.id = username + "_people";

    var thumbPerson = document.createElement('img');
    thumbPerson.width = "40";
    thumbPerson.height = "40"
    thumbPerson.src = "/src/img/friend-request(2).png";
    thumbPerson.classList.add("Thumbnail");

    var personName = document.createElement("h3");
    personName.classList.add("contactUserName");
    personName.innerHTML = username;
     
    var sendButton = document.createElement('button');
    sendButton.setAttribute("onclick","sendRequest(this)");
    sendButton.classList.add('requestBtn');
    sendButton.textContent = "Send";
    
    person.appendChild(thumbPerson);
    person.appendChild(personName);
    person.appendChild(sendButton);
    return person;
}
function makeRequest(username)
{
    var requestSend = document.createElement('div');
    requestSend.classList.add('request');
    requestSend.id = username + "_request";

    var thumbRequest = document.createElement('img');
    thumbRequest.width = "40";
    thumbRequest.height = "40";
    thumbRequest.src = "/src/img/friend-request(2).png";
    thumbRequest.classList.add("Thumbnail");

    var requestName = document.createElement("h3");
    requestName.innerHTML = username;
    requestName.classList.add("contactUserName");
     
    var acceptButton = document.createElement('button');
    acceptButton.setAttribute("onclick","acceptRequest(this)");
    acceptButton.classList.add('requestBtn');
    acceptButton.textContent = "Accept";
    
    requestSend.appendChild(thumbRequest);
    requestSend.appendChild(requestName);
    requestSend.appendChild(acceptButton);
    
    return requestSend;
}
function showTypes(img)
{
    if(!img.classList.contains('down'))
    {
        img.classList.toggle('arrowUp');
        document.getElementById('typeBox').style.display  = "block";
        img.classList.toggle('down');
    }
    else
    {
        img.classList.remove('arrowUp');
        document.getElementById('typeBox').style.display  = "none";
        img.classList.toggle('down');
    }
}
function setStatus(type)
{
    document.getElementById('statusBorder').classList.replace(document.getElementById('statusBorder').classList[0],`${type}Border`);
    document.getElementById('typeBox').style.display  = "none";
    document.getElementById('downArrow').classList.toggle('down');
    socket.emit('sendStatus',
    {
        username:username,
        status:type
    });
}
function createVideoChat(button)
{
    alert("This feature is not yet implemented.")
}
function sendMessage(button)
{
    var message = document.getElementById('inputMessage');
    if(message.value.trim() === "")
        alert("Enter The Message.")
    else
    {
        var messagePayload = {
            to:document.getElementById('chatId').textContent,
            from:username,
            payload:message.value.trim(),
            type:'text',
            timeStamp:Date.now()
        }
        addMessage(messagePayload,'sent');
        socket.emit('sendMessage',messagePayload)
        message.value ="";
        fetchedHistory[messagePayload.to].messages.push(messagePayload);
    }
}
function changeChat(username)
{
    const contact = document.getElementById(username +"_Contact");
    contact.style.backgroundColor = 'transparent';    

    var chatHeader = document.createElement('header');
    chatHeader.classList.add('chatHeader');

    var chatHeaderLeft = document.createElement('div');
    chatHeaderLeft.classList.add('chatHeaderLeft');
    
    var Thumbnail = document.createElement('img');
    Thumbnail.classList.add('Thumbnail');
    Thumbnail.src = "/src/img/friend-request.png";

    var name = document.createElement('h3');
    name.id = 'chatname';
    name.innerHTML = username;
    
    var chatId = document.createElement('p');
    chatId.id = "chatId";
    chatId.innerHTML = username;
    chatId.style.display = 'none';
    
    chatHeaderLeft.appendChild(Thumbnail);
    chatHeaderLeft.appendChild(name);

    var chatHeaderRight = document.createElement('div');
    chatHeaderRight.classList.add('chatHeaderRight');

    var chatThumbnail = document.createElement('img');
    chatThumbnail.classList.add('chatThumbnail');
    chatThumbnail.src = "/src/img/video-chat.png";            
    chatThumbnail.onclick = createVideoChat
    chatHeaderRight.appendChild(chatThumbnail);

    chatHeader.appendChild(chatHeaderLeft);
    chatHeader.appendChild(chatHeaderRight);

    var chat = document.createElement('div');
    chat.classList.add('chat');
    chat.id = "chat";
    
    var sendBar = document.createElement('div');
    sendBar.classList.add('sendBar');


    var sendBarHTML = `<input type="text" placeholder="Write your message..." id="inputMessage">
<button id="send"><img src="/src/img/send1.svg"  alt="" onclick="sendMessage(this)" ></button>`;
    sendBar.innerHTML = sendBarHTML.trim()

    var chatContainer = document.getElementById('chatContainer');
    chatContainer.innerHTML = "";
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(chat);
    chatContainer.appendChild(sendBar);
    chatContainer.appendChild(chatId);

    const myUserName = document.getElementById('myusername').innerHTML;
    if(!fetchedHistory[username]){
        socket.emit('fetchHistory',{user:myUserName,friend:username});
    }
    else{
        InsertsChat(fetchedHistory[username],myUserName);
        console.warn('catch loaded');
    }
}
function makeMessage(message,type)
{
    var messageBox = document.createElement('div');
    messageBox.classList.add('messageBox');
    messageBox.classList.add(type);

    var msg = document.createElement('p');
    msg.innerHTML = message;

    var chatThumbnail = document.createElement('img');
    chatThumbnail.classList.add('chatThumbnail');
    chatThumbnail.src = "/src/img/friend-request.png";
    
    if(type === 'sent')
    {
        messageBox.appendChild(msg);
        messageBox.appendChild(chatThumbnail);
    }
    else
    {
        messageBox.appendChild(chatThumbnail);
        messageBox.appendChild(msg);
    }
    return messageBox;
}
function addMessage(message,type)
{
    var chat = document.getElementById('chat');
    var from = message.from;
    var openChatUser = document.getElementById('chatname').innerHTML;
    if(chat && (openChatUser === from || type === 'sent'  ))
    {
        var msg = makeMessage(message.payload,type);
        chat.appendChild(msg);
        chat.scrollTo(0,chat.scrollHeight)
    }
    else if(type === 'received')
    {
        const contact = document.getElementById(from +"_Contact");
        contact.style.backgroundColor = 'green'  
        document.getElementById(from + "_last_message").innerHTML = message.payload;  
        alert("Chat is not selected");
    }
    const chatName = document.getElementById('chatname').innerHTML;
    document.getElementById(chatName + "_last_message").innerHTML = message.payload;
}
function makeContact(username)
{
    var contact = document.createElement('div');
    contact.classList.add('contact');
    contact.id = username+"_Contact";

    var contactPic = document.createElement('div');
    contact.classList.add('contactPic');

    var contactStatus = document.createElement('span');
    contactStatus.id = username + "_Status";
    contactStatus.classList.add('contactStatus');
    contactStatus.classList.add('busy');
        
    var Thumbnail = document.createElement('img');
    Thumbnail.classList.add('Thumbnail');
    Thumbnail.src = "/src/img/friend-request.png";

    var contactMeta = document.createElement('ul');
    contactMeta.classList.add('contactMeta');

    var contactUserName = document.createElement('li');
    contactUserName.classList.add('contactUserName');
    contactUserName.innerHTML = username;

    var contactUserMsg = document.createElement('li');
    contactUserMsg.classList.add('contactUserMsg');
    contactUserMsg.id = username + "_last_message";
    contactUserMsg.innerHTML = "Last Message";

    contactPic.appendChild(contactStatus)
    contactPic.appendChild(Thumbnail)

    contactMeta.appendChild(contactUserName);
    contactMeta.appendChild(contactUserMsg);
    
    contact.appendChild(contactPic);
    contact.appendChild(contactMeta);
    
    contact.onclick = () =>{
        changeChat(username)
    };
    return contact;
}
function addContact(username){
    var contactList = document.getElementById('contacts');
    var contact = makeContact(username);
    contactList.appendChild(contact);
}
function addPerson(username){
    var people = document.getElementById('peopleList');
    var person = makePerson(username);
    people.appendChild(person);
}
function addRequest(username)
{
    var requests = document.getElementById('requestList');
    requests.appendChild(makeRequest(username));
}
function sendRequestBtn()
{
    document.getElementById('requests').style.display = "block";
}
function closes(btn)
{
    btn.parentElement.parentElement.style.display = `none`;
}
function searchPeopleBtn()
{
    document.getElementById(`allPeople`).style.display = `block`;
}
function sendRequest(btn)
{
    var user = btn.parentNode.childNodes[1].textContent;
    btn.textContent = "Sent!"
    socket.emit('sendReq',{from:username,to:user});
}
function acceptRequest(btn)
{
    btn.textContent = "Accepted";
    var user = btn.parentNode.childNodes[1].textContent;
    socket.emit('acceptReq',{from:username,to:user});
}
function InsertsChat(chat,user)
{
    for(index in chat.messages){
        const type = user === chat.messages[index].from?'sent':'received';
        addMessage(chat.messages[index],type);
    }
}
function makeProfile(userInfo){
    
    var profile = document.getElementById('profile')

    var leftProfile = document.createElement('div');
    leftProfile.classList.add('leftProfile');

    var profilePic = document.createElement('div');
    profilePic.classList.add('profilePic');
    
    var statusBorder = document.createElement('img');
    statusBorder.src = "/src/img/friend-request.png" ;//userInfo.profilePic;
    statusBorder.alt = "status";
    statusBorder.width = "50"
    statusBorder.height = "50"
    statusBorder.classList.add('onlineBorder');
    statusBorder.id = "statusBorder";

    profilePic.appendChild(statusBorder);

    var username = document.createElement('div');
    username.classList.add('username');
    
    var myname = document.createElement('h3');
    myname.id = "myname";
    myname.style.color = "aliceblue";
    myname.innerHTML = userInfo.firstName +" "+ userInfo.lastName;

    var myusername = document.createElement('p');
    myusername.id = "myusername";
    myusername.innerHTML = userInfo.username;
    myusername.style.display = "none";

    username.append(myname,myusername);
    leftProfile.append(profilePic,username);

    var rightProfile = document.createElement('div');
    rightProfile.classList.add('rightProfile');
    
    var tray = document.createElement('div');
    tray.classList.add('tray');

    var downArrow = document.createElement('img');
    downArrow.src = "/src/img/down-arrow.svg";
    downArrow.alt = "showStatusOptions";
    downArrow.width = "20"
    downArrow.height = "20"
    downArrow.classList.add('arrow');
    downArrow.id = "downArrow";
    downArrow.onclick = () => {showTypes(downArrow)};

    tray.appendChild(downArrow);
    rightProfile.appendChild(tray);

    profile.appendChild(leftProfile);
    profile.appendChild(rightProfile)
}