const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const path = require('path');
const session = require('express-session');
const uuidv1 = require('uuid/v1');

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

//express session api example code
app.use(session({
    secret: "fd34s@!@dfa453f3DF#$D&W",
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
            req.session.user = req.query.userName;
            console.log(""+req.session.user);
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
      res.send(req.session.user);
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
  else if(req.query.mode == "getChannelMessages") {
    let channelName = req.query.channelName;
    con.query("SELECT message FROM Channel" + channelName, function(err, result, fields) {
      if (err) throw err;
      let json = {};
      json["messages"] = result;
      res.send(JSON.stringify(json));
    });
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
        sql = "INSERT INTO channels (name) VALUES ('" + req.body.channelName.replace(" ", "_") + "')";
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
app.post('/messages', jsonParser, function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  if(req.body.mode == "send") {
    con.query("INSERT INTO Channel" + req.body.channelName + " (message) VALUES ('" + req.body.userMessage.replace("'", "''") + "')", function(err, result) {
      if (err) throw err;
      res.send("success");
    });
  }
})

app.locals.title = "new app";

app.listen(3000);
