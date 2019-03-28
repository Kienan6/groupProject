"use strict";
(function(){
  function initialize() {
    //let url = "http://ec2-3-85-40-76.compute-1.amazonaws.com";
    let url = "http://localhost:3000"

    fetch(url)
      .then(checkStatus)
      .then(function(responseText) {
        let helloWorld = document.createElement("p");

        helloWorld.innerHTML = responseText;
        document.getElementById("content").appendChild(helloWorld);
      })
      .catch(function(error) {
        console.log(error);
    });
  }

  function checkStatus(response) {
    return response.text();
  }

  window.onload = initialize;
})();
