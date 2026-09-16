var $messages = $('.messages-content');

var myName = "";
var lastMinute = null;

var ALLOWED_NAMES = ["Tushi", "Edward"];

$(window).on("load", function () {

    while (true) {

        var enteredName = prompt("Enter your name:");

        if (enteredName === null) {
            document.body.innerHTML = "";
            return;
        }

        enteredName = enteredName.trim();

        if (enteredName === "Tushi" || enteredName === "Edward") {
            myName = enteredName;
            break;
        }

        alert("Access denied.");
    }

    $messages.mCustomScrollbar({
        theme: "dark",
        scrollInertia: 150,
        autoHideScrollbar: false,
        mouseWheel: {
            enable: true
        },
        keyboard: {
            enable: true
        }
    });

    firebase.database().ref("messages").on("child_added", function (snapshot) {

        var data = snapshot.val();

        if (!data || !data.message || !data.sender) {
            return;
        }

        var message = $('<div class="message"></div>');
        var avatar = $('<figure class="avatar"></figure>');
        var image = $('<img>').attr(
            "src",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpdX6tPX96Zk00S47LcCYAdoFK8INeCElPeJrVDrh8phAGqUZP_g"
        );

        avatar.append(image);

        var content = $('<div></div>')
            .attr("id", "message-" + snapshot.key)
            .text(data.message);

        if (data.sender === myName) {

            message.addClass("message-personal");

            message.append(avatar);
            message.append(content);

            var deleteButton = $('<button type="button">Delete</button>');

            deleteButton
                .addClass("btn-delete")
                .attr("data-id", snapshot.key);

            deleteButton.on("click", function () {
                deleteMessage(this);
            });

            content.append(deleteButton);

        } else {

            message.append(avatar);

            var otherContent = $('<div></div>')
                .attr("id", "message-" + snapshot.key)
                .text(data.sender + ": " + data.message);

            message.append(otherContent);
        }

        $('.mCSB_container').append(message);

        setDate(message);

        updateScrollbar();

        message.addClass("new");

        setTimeout(function () {
            message.removeClass("new");
        }, 500);
    });

    firebase.database().ref("messages").on("child_removed", function (snapshot) {

        var messageElement = document.getElementById(
            "message-" + snapshot.key
        );

        if (messageElement) {

            var parentMessage = messageElement.closest(".message");

            if (parentMessage) {
                parentMessage.remove();
            }

            updateScrollbar();
        }
    });
});


function updateScrollbar() {

    $messages.mCustomScrollbar("update");

    setTimeout(function () {

        $messages.mCustomScrollbar("scrollTo", "bottom", {
            scrollInertia: 150,
            timeout: 0
        });

    }, 50);
}


function setDate(messageElement) {

    var now = new Date();

    var currentMinute = now.getMinutes();

    if (lastMinute !== currentMinute) {

        lastMinute = currentMinute;

        var hours = String(now.getHours()).padStart(2, "0");
        var minutes = String(now.getMinutes()).padStart(2, "0");

        $('<div></div>')
            .addClass("timestamp")
            .text(hours + ":" + minutes)
            .appendTo(messageElement);
    }
}


function insertMessage() {

    var message = $('.message-input').val().trim();

    if (message === "") {
        return false;
    }

    if (
        myName !== "Tushi" &&
        myName !== "Edward"
    ) {
        return false;
    }

    sendMessage(message);

    return true;
}


function sendMessage(message) {

    firebase.database()
        .ref("messages")
        .push()
        .set({
            message: message,
            sender: myName,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        })
        .then(function () {

            $('.message-input').val("");

        })
        .catch(function (error) {

            alert("Message could not be sent.");

            console.error(error);
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

            alert("Message could not be deleted.");

            console.error(error);
        });
}


$('.message-submit').on("click", function () {
    insertMessage();
});


$('.message-input').on("keydown", function (e) {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        insertMessage();
    }
});