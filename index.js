const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
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

app.use(express.static('public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  if(req.query.mode == "singleUser") {
    let sql = "SELECT id FROM users WHERE userName = '" + req.query.userName + "'";
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      if(result.length > 0) {
        sql = "SELECT id FROM users WHERE password = '" + req.query.password + "'";
        con.query(sql, function(err2, result2, fields2) {
          if(result2.length > 0) {
            res.send("success");
          } else {
            res.send("failure");
          }
        });
      } else {
        res.send("failure");
      }
    });
  }
});

app.post('/', jsonParser, function(req, res) {
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
})

app.locals.title = "new app";

app.listen(3000);
