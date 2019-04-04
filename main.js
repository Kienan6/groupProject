"use strict";
  let currentChannel = "";

  function initialize() {
    //let url = "http://ec2-3-85-40-76.compute-1.amazonaws.com";
    updateChannelList();
    //setInterval(updatePage, 1000);
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
    let form = document.getElementById("login");
    let errorlogin = document.getElementById("error-login");
    let username = form.elements[0].value;
    let password = form.elements[1].value;
    if( password.length == 0 || username.length == 0 ){
      errorlogin.innerText = "Username or password is empty";
      return;
    }
    let url = "http://localhost:3000/user?mode=login&userName=" + username + "&password=" + password;
    fetch(url)
      .then(checkStatus)
      .then(function(responseText) {
        if(responseText != "failure") {
          alert("Logged In");
          location.reload();
        } else {
          alert("Failed to log in. Username or password is incorrect");
        }
      })
      .catch(function(error) {
        console.log(error);
    });
  }
  function logout() {
    let url = "http://localhost:3000/user?mode=logout";
    fetch(url)
      .then(checkStatus)
      .then(function(response){
        location.reload();
      })
      .catch(function(error) {
        console.log(error);
    });
  }
  function getUser() {
    let url = "http://localhost:3000/user?mode=getUsername";
    return fetch(url)
  }
  function createAccount() {
    let form = document.getElementById("create");
    let errorlogin = document.getElementById("error-login");
    let username = form.elements[0].value;
    let password = form.elements[1].value;
    if( password.length == 0 || username.length == 0 ){
      errorlogin.innerText = "Username or password is empty";
      return;
    }
    const message = {mode: "newUser",
                     userName: username,
                     password: password}; // set fields of the message object to the current name and comment
    const fetchOptions = {
        method : 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(message)
    };
    let url = "http://localhost:3000/user";
    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function(responseText) {
        if(responseText == "success") {
          alert("Account successfully created");
          //hide the create form and show the login form
          showCreateForm();
          showLoginForm();
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
    let url = "http://localhost:3000/channels";
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
    let url = "http://localhost:3000/channels?mode=getChannels";
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
    let url = "http://localhost:3000/channels?mode=getChannelMessages&channelName=" + channelName;
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
    const message = {mode: "send",
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
    let url = "http://localhost:3000/messages";
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

  window.onload = initialize;

function showLoginForm() {
        getUser().then(checkStatus)
          .then(function(responseText){
            var popout = document.getElementById("login-form");
            var logoutform = document.getElementById("logout-form");
            var visible = popout.style.display;
            console.log(responseText);
            if(responseText == "false") {
              if(visible == "block"){
                popout.style.display= "none";
              } else {
                popout.style.display = "block";
                document.getElementById("error-login").innerText = "";
              }
              console.log(responseText);
            } else {
              visible = logoutform.style.display;
               if(visible == "block"){
                logoutform.style.display= "none";
              } else {
                logoutform.style.display = "block";
              }
              popout.style.display= "none";
            }
          })
          .catch(function(error) {
            console.log(error);
        });
}
function showCreateForm() {
        var popout = document.getElementById("create-form");
        var visible = popout.style.display;
        if(visible == "block"){
          popout.style.display= "none";
        } else {
          popout.style.display = "block";
          document.getElementById("error-login").innerText = "";
        }
}
function addChannelElem(img, name) {
  let container = document.getElementById("channels-list");
  let newChannel = document.createElement("div");
  newChannel.setAttribute("class", "channel");
  let avatar = document.createElement("div");
  avatar.setAttribute("class", "avatar-channel");
  let avatarimg = document.createElement("img");
  avatarimg.setAttribute("src", img);
  let n = document.createElement("span");
  n.setAttribute("class", "channel-name");
  let header = document.createElement("h4");
  header.innerText = name;
  n.appendChild(header);
  avatar.appendChild(avatarimg);
  newChannel.append(avatar,n);
  container.append(newChannel);

}
function createMessageElem(userImg, message) {
  let container = document.getElementById("message-container");
  let m = document.createElement("div");
  m.setAttribute("class", "message");
  let avatar = document.createElement("div");
  avatar.setAttribute("class", "message-avatar");
  let img = document.createElement("img");
  img.setAttribute("src", userImg);
  let txtContainer = document.createElement("div");
  txtContainer.setAttribute("class", "message-text");
  let p = document.createElement("p");
  p.innerText = message;
  txtContainer.appendChild(p);
  avatar.appendChild(img);
  m.append(avatar, txtContainer);
  container.appendChild(m);
}
