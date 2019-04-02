"use strict";
(function(){
  function initialize() {
    //let url = "http://ec2-3-85-40-76.compute-1.amazonaws.com";
    document.getElementById("log-in-button").onclick = logIn;
    document.getElementById("create-account-button").onclick = createAccount;
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

  window.onload = initialize;
})();
