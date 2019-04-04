const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const session = require('express-session');
const http = require('http').Server(app);
const io = require("socket.io")(http);

var mysql = require('mysql');
var con = mysql.createConnection({
  host: "csc-346-group-project.cf7ec6pc0dbo.us-east-1.rds.amazonaws.com",
  user: "quinnal2",
  password: "csc346proj"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected");
});
con.query("USE csc_346_group_project", function (err, result) {
  if (err) throw err;
});
app.use("/", express.static(__dirname));
app.use("/profile", express.static(__dirname + "/profile"));

io.on('connection', () =>{
 console.log('connected t');
});

//express session api example code
app.use(session({
    secret: "aaleodkv!%%asd@",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept");
	next();
});


app.get('/logged_in', function(req, res) {
  if(req.session.user){
    res.send("true");
  } else {
    res.send("false");
  }
});
app.get('/user', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  if(req.query.mode == "login") {
    let sql = "SELECT id FROM users WHERE userName = '" + req.query.userName + "'";
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      if(result.length > 0) {
        sql = "SELECT id FROM users WHERE password = '" + req.query.password + "'";
        con.query(sql, function(err2, result2, fields2) {
          if(result2.length > 0) {
            req.session.user = {username: req.query.userName, curChannel: ""};
            console.log(""+req.session.user.username);
            res.send("success");
            //create session variable
          } else {
            res.send("failure");
          }
        });
      } else {
        res.send("failure");
      }
    });
  } else if( req.query.mode == "logout"){
    req.session.destroy(function(err) {
      if(err) console.log(err);
      res.redirect('/');
    });
  } else if(req.query.mode == "getUsername") {
    if(req.session.user){
      res.send(req.session.user.username);
    } else {
      res.send("false");
    }
  }

});
app.get('/channels', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  if(req.query.mode == "getChannels") {
    if(req.session.user){
      con.query("SELECT name FROM channels", function(err, result, fields) {
      if (err) throw err;
      let json = {};
      json["channelNames"] = result;
      res.send(JSON.stringify(json));
    });
    } else {
      res.send("false");
    }
  }
  else if(req.query.mode == "getChannelMessages") { //needs to be fixed
    let channelName = req.query.channelName;
    con.query("SELECT id FROM channels WHERE name = '"+ channelName +"'", function(err, result, fields){
      if(err) throw err;
      con.query("SELECT message FROM messages WHERE channel_id = " + result[0].id, function(err, result1, fields) {
      if (err) throw err;
      let json = {};
      json["messages"] = result1;
      res.send(JSON.stringify(json));
    });
    });
  } else if(req.query.mode == "onlineUsers"){
      let channelName = req.query.channelName;
      con.query("SELECT online FROM channels WHERE name = '" + channelName+"'", function(err, result, fields) {
        if (err) throw err;
        let onlineUsers = result[0].online;
        console.log(onlineUsers);
        //this can be split by commas
        res.send(JSON.stringify(onlineUsers));
      });
  } else if(req.query.mode == "set"){
    let channelName = req.query.channelName;
    if(req.session.user){
      con.query("SELECT id FROM users where username ='"+req.session.user.username+"'", function(err, result){
        if (err) throw err;
        let userID = result[0].id;
        con.query("SELECT online FROM channels WHERE name = '" +req.session.user.curChannel+"'", function(err, result1) {
          if (err) throw err;
          let online = "";
          if(result[0].length > 0){
            //online in current channel
            online = result1[0].online;
            online = online.split(",");
            //loop through the online people and delete the current user
            for(var i = 0; i < online.length; i++){
              if(online[i] == userID) {
                online.splice(i, 1);
              }
            }
            online.toString();
          }
          con.query("UPDATE channels SET online = '"+online+"' WHERE name='"+req.session.user.curChannel+"'", function(err,result2){
            if (err) throw err;
            //set new channel as online
            con.query("SELECT online FROM channels WHERE name = '" +channelName+"'", function(err, result3) {
              if (err) throw err;
              online = result3[0].online;
                //set new channel
              if(online.length == 0){
                online += userID;
              } else {
                online += ","+userID;
              }
              con.query("UPDATE channels SET online = '"+online+"' WHERE name='"+channelName+"'", function(err,result4){
                if (err) throw err;
                //IO UPDATEEEEEE THE WEBPAGEEEE MAYBEEEE
                req.session.user.curChannel = channelName;
                res.send("success set and removed from old channel");
              });
            });
          });
        });
      });
    }
  }
});
app.post('/messages', jsonParser, function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  if(req.body.mode == "send") {
    if(req.session.user){
      let sql = "SELECT id FROM channels WHERE name = '" + req.session.user.curChannel.replace(" ", "_") + "'";
      console.log("SELECT id FROM channels WHERE name = '" + req.session.user.curChannel.replace(" ", "_") + "'");
        con.query(sql, function(err, result, fields){
          if (err) throw err;
          con.query("SELECT id FROM users WHERE userName = '" + req.session.user.username+"'", function(err, result1){
            if (err) throw err;
            con.query("INSERT INTO messages (channel_id, message, user_id) VALUES ("+result[0].id+", '" + req.body.userMessage.replace("'", "''") + "' ,"+ result1[0].id +")", function(err, result2) {
              if (err) throw err;
              res.send("success");
              //IO EMITTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
                  io.emit('chat', req.body.userMessage.replace("'", "''"));
            });
          });
      });
    } else {
      res.send("false");
    }
  }
});
app.post('/user', jsonParser, function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  if(req.body.mode == "newUser") {
    let sql = "SELECT id FROM users WHERE userName = '" + req.body.userName + "'";
    con.query(sql, function(err, result, fields) {
      if (err) throw err;
      console.log("Length: " + result.length);
      if(result.length == 0) {
        sql = "INSERT INTO users (userName, password) VALUES ('" + req.body.userName + "','" + req.body.password + "')";
        con.query(sql, function (err2, result2) {
          if (err2) throw err2;
          console.log("1 record inserted");
          res.send("success");
        });
      } else {
        res.send("failure");
      }
    });
  }
});
app.post('/channels', jsonParser, function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  if(req.body.mode == "createChannel") {
    let sql = "SELECT id FROM channels WHERE name = '" + req.body.channelName.replace(" ", "_") + "'";
    con.query(sql, function(err, result, fields) {
      if (err) throw err;
      console.log("Length: " + result.length);
      if(result.length == 0) {
        sql = "INSERT INTO channels (name) VALUES ('" + req.body.channelName.replace(" ", "_") + "," + req.body.description +"')";
        con.query(sql, function (err2, result2) {
          if (err2) throw err2;
          console.log("1 record inserted");
        });
        sql = "CREATE TABLE IF NOT EXISTS Channel" + req.body.channelName.replace(" ", "_") + " (id Int AUTO_INCREMENT, message VARCHAR(65000) NOT NULL, PRIMARY KEY (id));";
        con.query(sql, function (err2, result2) {
          if (err2) throw err2;
          console.log("1 record inserted");
          res.send("success");
        });
      } else {
        res.send("failure");
      }
    });
  }
});

app.locals.title = "new app";

http.listen(3000, () => {
  console.log('server is running on port');
});