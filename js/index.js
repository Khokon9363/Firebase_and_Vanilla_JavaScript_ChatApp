var messagesBox=document.getElementById("messages");
var messagesContent=document.getElementById("messagesContent");
var messageInput=document.getElementById("message");
var sendButton=document.getElementById("sendButton");

var myName="";
var lastMinute=null;
var ALLOWED_NAMES=["Tushi","Edward"];
var audioContext=null;
var audioUnlocked=false;
var initialMessagesLoaded=false;
var notificationPermissionGranted=false;

function login(){
    while(true){
        var name=prompt("Enter your name:");
        if(name===null){
            document.body.innerHTML="";
            return false;
        }
        name=name.trim();
        if(ALLOWED_NAMES.indexOf(name)!==-1){
            myName=name;
            return true;
        }
        alert("Access denied.");
    }
}

function requestNotificationPermission(){
    if(!("Notification" in window)){
        alert("Notification API is not supported on this browser.");
        return;
    }

    if(Notification.permission==="granted"){
        notificationPermissionGranted=true;
        return;
    }

    if(Notification.permission==="denied"){
        alert("Notification permission is blocked. Please allow notifications from your browser settings.");
        return;
    }

    Notification.requestPermission().then(function(permission){
        if(permission==="granted"){
            notificationPermissionGranted=true;
        }else{
            alert("Notification permission was not granted.");
        }
    }).catch(function(error){
        alert("Notification permission error:\n"+error.message);
    });
}

function unlockAudio(){
    try{
        var AudioContextClass=window.AudioContext||window.webkitAudioContext;
        if(!AudioContextClass){
            alert("This browser does not support audio.");
            return false;
        }

        if(!audioContext){
            audioContext=new AudioContextClass();
        }

        if(audioContext.state==="suspended"){
            audioContext.resume().then(function(){
                audioUnlocked=true;
            }).catch(function(error){
                alert("Audio permission/unlock failed:\n"+error.message);
            });
        }else{
            audioUnlocked=true;
        }

        return true;
    }catch(error){
        alert("Audio error:\n"+error.message);
        return false;
    }
}

function requestVibrationPermission(){
    if(!("vibrate" in navigator)){
        alert("Vibration is not supported by this browser/device.");
        return false;
    }

    if(typeof navigator.vibrate!=="function"){
        alert("Vibration API is unavailable.");
        return false;
    }

    try{
        var result=navigator.vibrate([100,50,100]);
        if(result===false){
            alert("Vibration was rejected by the browser/device.");
            return false;
        }
        return true;
    }catch(error){
        alert("Vibration error:\n"+error.message);
        return false;
    }
}

function requestNotificationAccess(){
    requestNotificationPermission();
    unlockAudio();
    requestVibrationPermission();
}

document.addEventListener("click",function(){
    unlockAudio();
},{passive:true});

document.addEventListener("touchstart",function(){
    unlockAudio();
},{passive:true});

function playNotificationSound(){
    try{
        if(!audioContext){
            if(!unlockAudio()){
                return false;
            }
        }

        if(audioContext.state==="suspended"){
            audioContext.resume().catch(function(error){
                alert("Audio resume failed:\n"+error.message);
            });
        }

        var now=audioContext.currentTime;

        var oscillator1=audioContext.createOscillator();
        var gain1=audioContext.createGain();

        oscillator1.type="sine";
        oscillator1.frequency.setValueAtTime(1000,now);
        oscillator1.frequency.setValueAtTime(750,now+0.18);

        gain1.gain.setValueAtTime(0.001,now);
        gain1.gain.exponentialRampToValueAtTime(0.8,now+0.03);
        gain1.gain.exponentialRampToValueAtTime(0.001,now+0.30);

        oscillator1.connect(gain1);
        gain1.connect(audioContext.destination);

        oscillator1.start(now);
        oscillator1.stop(now+0.31);

        var oscillator2=audioContext.createOscillator();
        var gain2=audioContext.createGain();

        oscillator2.type="sine";
        oscillator2.frequency.setValueAtTime(1000,now+0.38);
        oscillator2.frequency.setValueAtTime(750,now+0.56);

        gain2.gain.setValueAtTime(0.001,now+0.38);
        gain2.gain.exponentialRampToValueAtTime(0.8,now+0.41);
        gain2.gain.exponentialRampToValueAtTime(0.001,now+0.68);

        oscillator2.connect(gain2);
        gain2.connect(audioContext.destination);

        oscillator2.start(now+0.38);
        oscillator2.stop(now+0.69);

        return true;
    }catch(error){
        alert("Notification sound failed:\n"+error.message);
        return false;
    }
}

function vibrateNotification(){
    try{
        if(!("vibrate" in navigator)){
            alert("This device/browser does not support vibration.");
            return false;
        }

        if(typeof navigator.vibrate!=="function"){
            alert("Vibration API is unavailable.");
            return false;
        }

        var result=navigator.vibrate([250,100,250]);

        if(result===false){
            alert("Vibration request was rejected.");
            return false;
        }

        return true;
    }catch(error){
        alert("Vibration failed:\n"+error.message);
        return false;
    }
}

function showBrowserNotification(data){
    if(!("Notification" in window)){
        return;
    }

    if(Notification.permission!=="granted"){
        return;
    }

    try{
        var notification=new Notification(data.sender+" sent a message",{
            body:data.message,
            tag:"chat-message",
            renotify:true
        });

        setTimeout(function(){
            notification.close();
        },5000);
    }catch(error){
        console.log("Browser notification error:",error);
    }
}

function notifyNewMessage(data){
    var soundOK=playNotificationSound();
    var vibrationOK=vibrateNotification();

    showBrowserNotification(data);

    if(!soundOK&&!vibrationOK){
        alert("Both sound and vibration failed.");
    }
}

function scrollBottom(){
    if(!messagesBox){
        return;
    }

    messagesBox.scrollTop=messagesBox.scrollHeight;

    setTimeout(function(){
        messagesBox.scrollTop=messagesBox.scrollHeight;
    },10);

    setTimeout(function(){
        messagesBox.scrollTop=messagesBox.scrollHeight;
    },50);

    setTimeout(function(){
        messagesBox.scrollTop=messagesBox.scrollHeight;
    },150);

    setTimeout(function(){
        messagesBox.scrollTop=messagesBox.scrollHeight;
    },300);
}

function createMessage(snapshot){
    var data=snapshot.val();

    if(!data||!data.message||!data.sender){
        return;
    }

    var message=document.createElement("div");
    message.className="message";

    if(data.sender===myName){
        message.classList.add("message-personal");
    }

    var avatar=document.createElement("figure");
    avatar.className="avatar";

    var avatarImage=document.createElement("img");
    avatarImage.src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpdX6tPX96Zk00S47LcCYAdoFK8INeCElPeJrVDrh8phAGqUZP_g";

    avatar.appendChild(avatarImage);

    var content=document.createElement("div");
    content.id="message-"+snapshot.key;

    if(data.sender===myName){
        content.textContent=data.message;

        var deleteButton=document.createElement("button");
        deleteButton.type="button";
        deleteButton.className="btn-delete";
        deleteButton.textContent="Delete";
        deleteButton.setAttribute("data-id",snapshot.key);

        deleteButton.addEventListener("click",function(){
            deleteMessage(this);
        });

        content.appendChild(deleteButton);
    }else{
        content.textContent=data.sender+": "+data.message;
    }

    message.appendChild(avatar);
    message.appendChild(content);
    messagesContent.appendChild(message);

    setDate(message);

    message.classList.add("new");

    setTimeout(function(){
        message.classList.remove("new");
    },400);

    scrollBottom();
}

function setDate(message){
    var now=new Date();
    var minute=now.getMinutes();

    if(lastMinute!==minute){
        lastMinute=minute;

        var hours=String(now.getHours()).padStart(2,"0");
        var minutes=String(now.getMinutes()).padStart(2,"0");

        var timestamp=document.createElement("div");
        timestamp.className="timestamp";
        timestamp.textContent=hours+":"+minutes;

        message.appendChild(timestamp);
    }
}

function sendMessage(){
    var message=messageInput.value.trim();

    if(message===""){
        return;
    }

    if(myName!=="Tushi"&&myName!=="Edward"){
        return;
    }

    unlockAudio();

    firebase.database().ref("messages").push({
        message:message,
        sender:myName,
        timestamp:firebase.database.ServerValue.TIMESTAMP
    }).then(function(){
        messageInput.value="";
        scrollBottom();
    }).catch(function(error){
        console.error(error);
        alert("Message could not be sent.");
    });
}

function deleteMessage(button){
    var messageId=button.getAttribute("data-id");

    if(!messageId){
        return;
    }

    if(!confirm("Delete this message?")){
        return;
    }

    firebase.database().ref("messages").child(messageId).remove().catch(function(error){
        console.error(error);
        alert("Message could not be deleted.");
    });
}

sendButton.addEventListener("click",function(){
    unlockAudio();
    sendMessage();
});

messageInput.addEventListener("keydown",function(event){
    if(event.key==="Enter"&&!event.shiftKey){
        event.preventDefault();
        unlockAudio();
        sendMessage();
    }
});

if(login()){

    requestNotificationAccess();

    var messagesRef=firebase.database().ref("messages").orderByChild("timestamp");

    messagesRef.once("value",function(){
        initialMessagesLoaded=true;
    });

    messagesRef.on("child_added",function(snapshot){
        var data=snapshot.val();

        createMessage(snapshot);

        if(!initialMessagesLoaded){
            return;
        }

        if(data&&data.sender&&data.sender!==myName){
            notifyNewMessage(data);
        }
    });

    firebase.database().ref("messages").on("child_removed",function(snapshot){
        var element=document.getElementById("message-"+snapshot.key);

        if(element){
            var message=element.closest(".message");

            if(message){
                message.remove();
            }
        }

        scrollBottom();
    });
}
