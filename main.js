"use strict";
(function(){
  let currentChannel = "";

  function initialize() {
    //let url = "http://ec2-3-85-40-76.compute-1.amazonaws.com";
    updateChannelList();
    setInterval(updatePage, 1000);
    document.getElementById("message-container").innerHTML = "";
    document.getElementById("log-in-button").onclick = logIn;
    document.getElementById("create-account-button").onclick = createAccount;
    document.getElementById("create-channel-button").onclick = createChannel;
    document.getElementById("send-message").onclick = sendMessage;
  }

  function updatePage() {
    updateChannelList();
  }

  function logIn() {
    let userName = prompt("Username", "");
    let password = prompt("Password:", "");
    let url = "http://localhost:3000?mode=singleUser&userName=" + userName + "&password=" + password;
    fetch(url)
      .then(checkStatus)
      .then(function(responseText) {
        if(responseText == "success") {
          document.getElementById("log-in").innerHTML = "";
          let successText = document.createElement("p");
          let logOutButton = document.createElement("button");

          successText.innerHTML = "Logged in as " + userName;
          logOutButton.innerHTML = "Log Out";
          logOutButton.id = "log-out-button";
          logOutButton.onclick = logOut();
          document.getElementById("log-in").appendChild(successText);
        } else {
          alert("Failed to log in. Username or password is incorrect");
        }
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  function createAccount() {
    let userName = prompt("Enter a username:", "");
    let password = prompt("Enter a password:", "");
    const message = {mode: "newUser",
                     userName: userName,
                     password: password}; // set fields of the message object to the current name and comment
    const fetchOptions = {
        method : 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(message)
    };
    let url = "http://localhost:3000";
    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function(responseText) {
        if(responseText == "success") {
          alert("Account successfully created");
        } else {
          alert("Failed to create account. Username already exists.");
        }
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  function createChannel() {
    let channelName = prompt("Enter a name for the channel:", "");
    const message = {mode: "createChannel",
                     channelName: channelName,}; // set fields of the message object to the current name and comment
    const fetchOptions = {
        method : 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(message)
    };
    let url = "http://localhost:3000";
    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function(responseText) {
        if(responseText == "success") {
          alert("Channel successfully created");
        } else {
          alert("Failed to create channel. Channel with that name already exists.");
        }
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  function updateChannelList() {
    let url = "http://localhost:3000?mode=getChannels";
    fetch(url)
      .then(checkStatus)
      .then(function(responseText) {
        document.getElementById("channels-list").innerHTML = "";
        let data = JSON.parse(responseText);
        for(let i = 0; i < data.channelNames.length; i++) {
          let channelDiv = document.createElement("div");
          let avatarChannel = document.createElement("div");
          let avatar = document.createElement("img");
          let channelNameSpan = document.createElement("span");
          let channelName = document.createElement("h4");

          channelDiv.className = "channel";
          avatarChannel.className = "avatar-channel";
          avatar.setAttribute("src", "images/avatar.jpg");
          avatar.setAttribute("alt", data.channelNames[i].name);
          channelNameSpan.className = "channel-name";
          channelName.innerHTML = data.channelNames[i].name.replace("_", " ");
          channelNameSpan.appendChild(channelName);
          avatarChannel.appendChild(avatar);
          avatarChannel.appendChild(channelNameSpan);
          channelDiv.appendChild(avatarChannel);
          document.getElementById("channels-list").appendChild(channelDiv);
          channelName.onclick = loadChannelMessages;
        }
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  function loadChannelMessages() {
    let channelName = this.innerHTML.replace(" ", "_");
    currentChannel = channelName;
    let url = "http://localhost:3000?mode=getChannelMessages&channelName=" + channelName;
    fetch(url)
      .then(checkStatus)
      .then(function(responseText) {
          let data = JSON.parse(responseText);
          document.getElementById("message-container").innerHTML = "";
          for(let i = 0; i < data.messages.length; i++) {
            let messageDiv = document.createElement("div");
            let messageAvatarDiv = document.createElement("div");
            let avatar = document.createElement("img");
            let messageTextDiv = document.createElement("div");
            let message = document.createElement("p");

            messageDiv.className = "message";
            messageAvatarDiv.className = "message-avatar";
            messageTextDiv.className = "message-text";
            avatar.setAttribute("src", "images/avatar.jpg");
            avatar.setAttribute("alt", "message-person");
            message.innerHTML = data.messages[i].message;
            messageAvatarDiv.appendChild(avatar);
            messageTextDiv.appendChild(message);
            messageDiv.appendChild(messageAvatarDiv);
            messageDiv.appendChild(messageTextDiv);
            document.getElementById("message-container").appendChild(messageDiv);
          }
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  function sendMessage() {
    let text = document.getElementById("message-textarea").value;
    const message = {mode: "sendMessage",
                     userMessage: text,
                     channelName: currentChannel}; // set fields of the message object to the current name and comment
    const fetchOptions = {
        method : 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(message)
    };
    let url = "http://localhost:3000";
    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function(responseText) {
        if(responseText == "success") {
          document.getElementById("message-textarea").value = "";
        } else {

        }
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response.text();
    } else if (response.status == 404) {
      return Promise.reject(new Error("Sorry, we couldn't find that page"));
    } else {
      return Promise.reject(new Error(response.status + ": " + response.statusText));
    }
  }

  function logOut() {

  }
  function showForm() {
        var popout = document.getElementById("login-form");
        var visible = popout.style.display;
        if(visible == "block"){
          popout.style.display= "none";
        } else {
          popout.style.display = "block";
        }
      }
  window.onload = initialize;
})();
