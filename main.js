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
    let url = window.location.href +"user?mode=login&userName=" + username + "&password=" + password;
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
    //also leave the channel todo
    let url = window.location.href +"user?mode=logout";
    fetch(url)
      .then(checkStatus)
      .then(function(response){
        //leave then reload
        location.reload();
      })
      .catch(function(error) {
        console.log(error);
    });
  }
  function joinChannel(channelName){
    channelName = channelName.replace(" ", "_");
    let url = window.location.href +"channels?mode=set&channelName="+channelName;
    fetch(url)
    .then(checkStatus)
    .then(function(response){
      loadChannelMessages(channelName);
      getDescription();
      getOnlineChannel(channelName)
      .then(checkStatus)
      .then(function(response){
        document.getElementById("online-table").innerHTML = "";
        response
        response =response.split(",");
        for(var i = 0; i < response.length; i++){
          addOnlineElem(response[i]);
        }
      })
      .catch(function(err){
        console.log(err);
      });
    })
    .catch(function(err){
      console.log(err);
    });
  }
  function getUser() {
    let url = window.location.href +"user?mode=getUsername";
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
    let url = window.location.href +"user";
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
  //existing channel
  function addChannel(){
    let channelName = prompt("Enter the name of the channel to join:", ""); 
    const message = {mode: "joinChannel",
                     channelName: channelName}; // set fields of the message object to the current name and comment
    const fetchOptions = {
        method : 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(message)
    };
    let url = window.location.href +"channels";
    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function(responseText) {
        if(responseText == "true") {
          alert("Channel successfully joined");
          updateChannelList();
        } else {
          alert("Failed to find channel.");
        }
      })
      .catch(function(error) {
        console.log(error);
    });
  }
  function createChannel() {
    let channelName = prompt("Enter a name for the channel:", "");
    let channelDesc = prompt("Enter a short description for the channel:", "");
    const message = {mode: "createChannel",
                     channelName: channelName,
                     desc: channelDesc}; // set fields of the message object to the current name and comment
    const fetchOptions = {
        method : 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(message)
    };
    let url = window.location.href +"channels";
    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function(responseText) {
        if(responseText == "true") {
          alert("Channel successfully created");
          updateChannelList();
        } else {
          alert("Failed to create channel. Channel with that name already exists.");
        }
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  function updateChannelList() {
    let url = window.location.href +"channels?mode=getChannels";
    fetch(url)
      .then(checkStatus)
      .then(function(responseText) {
        document.getElementById("channels-list").innerHTML = "";
        let data = JSON.parse(responseText);
        for(let i = 0; i < data.channelNames.length; i++) {
          if(data.channelNames[i].length >0) {
            console.log(data.channelNames[i]);
            addChannelElem("images/avatar.jpg", data.channelNames[i].split("_").join(" "));
          }
        }
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  function loadChannelMessages(channelName) { 
    currentChannel = channelName;
    let url = window.location.href +"channels?mode=getChannelMessages&channelName=" + channelName;
    fetch(url)
      .then(checkStatus)
      .then(function(responseText) {
          let data = JSON.parse(responseText);
          document.getElementById("message-container").innerHTML = "";
          for(let i = 0; i < data.messages.length; i++) {
            createMessageElem("images/avatar.jpg", data.messages[i].message);
          }
      })
      .catch(function(error) {
        console.log(error);
    });
  }
  function getOnlineChannel(channelName) {
    channelName = channelName.replace(" ", "_");
    let url = window.location.href +"channels?mode=onlineUsers&channelName=" + channelName;
    return fetch(url);
  }
  function sendMessage() {
    let text = document.getElementById("message-textarea").value;
    const message = {mode: "send",
                     userMessage: text}; // set fields of the message object to the current name and comment
    const fetchOptions = {
        method : 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(message)
    };
    let url = window.location.href +"messages";
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
  let nameUnderscore = name.replace(" ", "_");
  newChannel.setAttribute("class", "channel");
  newChannel.setAttribute("id", nameUnderscore);
  newChannel.setAttribute("onclick", "joinChannel('"+nameUnderscore+"')");
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
function addOnlineUser(userInfo) {
  if(userInfo.curChannel == document.getElementById("channel-name").innerText) {
    addOnlineElem(userInfo.username);
  }
}
function addOnlineElem(username) {
  var table = document.getElementById("online-table");
    var td = table.getElementsByTagName("td");
    var tr = table.getElementsByTagName("tr");
    var row = "";
    if(td.length % 5 == 0){
      row = table.insertRow(tr.length);
    } else {
      row = tr[tr.length-1];
    }
    var cell = row.insertCell();
    cell.innerHTML = '<h4>'+username+'<h34>';
}
function getDescription() {
  var container = document.getElementById("channel-description");
  let url = window.location.href +"channels?mode=getDescription";
  fetch(url)
  .then(checkStatus)
  .then(function(response){
    container.innerText = response.split("_").join(" ");
  })
  .then(fetch(window.location.href + "channels?mode=getChannelName")
    .then(checkStatus)
    .then(function(response){
      document.getElementById("channel-name").innerText = response;
    })
    .catch(function(err){
      console.log(err);
    })
    ) 
  .catch(function(err){
    console.log(err);
  })
}