var messagesBox = document.getElementById("messages");
var messagesContent = document.getElementById("messagesContent");
var messageInput = document.getElementById("message");
var sendButton = document.getElementById("sendButton");

var myName = "";
var lastMinute = null;

var ALLOWED_NAMES = ["Tushi", "Edward"];

function login() {

    while (true) {

        var name = prompt("Enter your name:");

        if (name === null) {
            document.body.innerHTML = "";
            return false;
        }

        name = name.trim();

        if (name === "Tushi" || name === "Edward") {
            myName = name;
            return true;
        }

        alert("Access denied.");
    }
}


function scrollBottom() {

    if (!messagesBox) {
        return;
    }

    messagesBox.scrollTop = messagesBox.scrollHeight;

    setTimeout(function () {
        messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 10);

    setTimeout(function () {
        messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 50);

    setTimeout(function () {
        messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 150);

    setTimeout(function () {
        messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 300);
}


function createMessage(snapshot) {

    var data = snapshot.val();

    if (!data || !data.message || !data.sender) {
        return;
    }

    var message = document.createElement("div");

    message.className = "message";

    if (data.sender === myName) {
        message.classList.add("message-personal");
    }

    var avatar = document.createElement("figure");
    avatar.className = "avatar";

    var avatarImage = document.createElement("img");

    avatarImage.src =
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpdX6tPX96Zk00S47LcCYAdoFK8INeCElPeJrVDrh8phAGqUZP_g";

    avatar.appendChild(avatarImage);

    var content = document.createElement("div");

    content.id = "message-" + snapshot.key;

    if (data.sender === myName) {

        content.textContent = data.message;

        var deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "btn-delete";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("data-id", snapshot.key);

        deleteButton.addEventListener("click", function () {
            deleteMessage(this);
        });

        content.appendChild(deleteButton);

    } else {

        content.textContent =
            data.sender + ": " + data.message;
    }

    message.appendChild(avatar);
    message.appendChild(content);

    messagesContent.appendChild(message);

    setDate(message);

    message.classList.add("new");

    setTimeout(function () {
        message.classList.remove("new");
    }, 400);

    scrollBottom();
}


function setDate(message) {

    var now = new Date();

    var minute = now.getMinutes();

    if (lastMinute !== minute) {

        lastMinute = minute;

        var hours = String(now.getHours()).padStart(2, "0");
        var minutes = String(now.getMinutes()).padStart(2, "0");

        var timestamp = document.createElement("div");

        timestamp.className = "timestamp";
        timestamp.textContent = hours + ":" + minutes;

        message.appendChild(timestamp);
    }
}


function sendMessage() {

    var message = messageInput.value.trim();

    if (message === "") {
        return;
    }

    if (
        myName !== "Tushi" &&
        myName !== "Edward"
    ) {
        return;
    }

    firebase.database()
        .ref("messages")
        .push({
            message: message,
            sender: myName,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        })
        .then(function () {

            messageInput.value = "";

            scrollBottom();

        })
        .catch(function (error) {

            console.error(error);
            alert("Message could not be sent.");

        });
}


function deleteMessage(button) {

    var messageId = button.getAttribute("data-id");

    if (!messageId) {
        return;
    }

    if (!confirm("Delete this message?")) {
        return;
    }

    firebase.database()
        .ref("messages")
        .child(messageId)
        .remove()
        .catch(function (error) {

            console.error(error);
            alert("Message could not be deleted.");
        });
}


sendButton.addEventListener("click", function () {
    sendMessage();
});


messageInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();
    }
});


if (login()) {

    firebase.database()
        .ref("messages")
        .orderByChild("timestamp")
        .on("child_added", function (snapshot) {

            createMessage(snapshot);

        });


    firebase.database()
        .ref("messages")
        .on("child_removed", function (snapshot) {

            var element = document.getElementById(
                "message-" + snapshot.key
            );

            if (element) {

                var message = element.closest(".message");

                if (message) {
                    message.remove();
                }
            }

            scrollBottom();
        });
}