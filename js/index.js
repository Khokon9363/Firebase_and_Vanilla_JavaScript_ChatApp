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

    if (ALLOWED_NAMES.indexOf(enteredName) !== -1) {
      myName = enteredName;
      break;
    }

    alert("Access denied.");
  }

  $messages.mCustomScrollbar({
    theme: "dark",
    scrollInertia: 150
  });

  firebase.database().ref("messages").on("child_added", function (snapshot) {

    var data = snapshot.val();

    if (!data || !data.message || !data.sender) {
      return;
    }

    var messageWrapper = $('<div></div>');
    var avatar = $('<figure class="avatar"></figure>');
    var avatarImg = $('<img>').attr(
      "src",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpdX6tPX96Zk00S47LcCYAdoFK8INeCElPeJrVDrh8phAGqUZP_g"
    );

    avatar.append(avatarImg);

    var messageContent = $('<div></div>')
      .attr("id", "message-" + snapshot.key)
      .text(data.message);

    if (data.sender === myName) {

      messageWrapper
        .addClass("message message-personal new")
        .append(avatar)
        .append(messageContent);

      var deleteButton = $('<button></button>')
        .addClass("btn-delete")
        .attr("type", "button")
        .attr("data-id", snapshot.key)
        .text("Delete");

      deleteButton.on("click", function () {
        deleteMessage(this);
      });

      messageContent.append(deleteButton);

    } else {

      messageWrapper
        .addClass("message new")
        .append(avatar)
        .append(
          $('<div></div>')
            .attr("id", "message-" + snapshot.key)
            .text(data.sender + ": " + data.message)
        );
    }

    $('.mCSB_container')
      .append(messageWrapper);

    setDate(messageWrapper);
    updateScrollbar();

    setTimeout(function () {
      messageWrapper.removeClass("new");
    }, 500);
  });

  firebase.database().ref("messages").on("child_removed", function (snapshot) {

    var messageElement = document.getElementById(
      "message-" + snapshot.key
    );

    if (messageElement) {
      messageElement.textContent = "This message has been deleted";
      messageElement.classList.add("deleted-message");
    }
  });
});

function updateScrollbar() {
  $messages
    .mCustomScrollbar("update")
    .mCustomScrollbar("scrollTo", "bottom", {
      scrollInertia: 150,
      timeout: 0
    });
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

  if (!myName || ALLOWED_NAMES.indexOf(myName) === -1) {
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

  var confirmed = confirm("Delete this message?");

  if (!confirmed) {
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

$('.message-submit').on('click', function () {
  insertMessage();
});

$('.message-input').on('keydown', function (e) {

  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    insertMessage();
  }
});