#!/usr/bin/env nodejs

var express = require("express");
var bodyParser = require("body-parser");
var bcrypt = require('bcrypt-nodejs');
var randtoken = require('rand-token');
var date = require('date-and-time');

//UPDATE users SET token=NULL, tokenDate=NULL WHERE TIMESTAMPDIFF(minute, tokenDate, NOW()) > 60;

var app = express();

var TOKEN_LENGTH = 40;

app.set("json spaces", 4);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//only for local testing
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// How to set up mysql database config
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "timemachinedb"
});

connection.connect();

setInterval(function() {
  	console.log("Checking for expired tokens");
  	//Delete tokens that have been set more than one hour ago
  var query = "UPDATE users SET token=NULL, tokenDate=NULL WHERE TIMESTAMPDIFF(minute, tokenDate, NOW()) > ?;";
  connection.query(query, [20], function (error, results, fields) {
    	if (error) {
        	throw error;
    	}
  });
}, (60 * 60 * 1000));  //check every hour

//GET & POST METHODS GO HERE
app.post("/register", function (req, res) {
    console.log("User attempting to register an account");
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);

    var query = "INSERT INTO users (fullName,staffID,password) VALUES(?,?,?);";
    connection.query(query, [req.body.name, req.body.email, hash], function (error, results, fields) {
        if (error) {
            throw error;
        }

        generateToken(req.body.email, function(token) {
          res.json({
              allow: true,
              token: token
          });
        });
    });
});

app.post("/login", function (req, res) {
    console.log("User attempting to login");
    var query = "SELECT password, token FROM users WHERE staffID=?;";
    connection.query(query, [req.body.email], function (error, results, fields) {
        if (error) {
            throw error;
        }
        //res.send("allow="+bcrypt.compareSync(req.body.password,results[0].password)+"&token="+results[0].token);
    	updateToken(req.body.email, results[0].token, function(token) {
        res.json({
            allow: bcrypt.compareSync(req.body.password,results[0].password),
            token: token
        });
      });
    });
});

function generateToken(staffID, callback) {
  var check = "SELECT token FROM users";
  connection.query(check, function (error, results, fields) {
      var oldToken = false;
      var token;
      do {
          token = randtoken.generate(TOKEN_LENGTH);
          for (i = 0; i < results.length; i++) {
              oldToken = oldToken || (token === results[i]);
          }
      } while (oldToken);
      updateToken(staffID, token, callback);
  });
}

function updateToken(staffID, token, callback) {
  var today = date.format(new Date(), 'YYYY/MM/DD HH:mm:ss');
  var query = "UPDATE users SET token=?, tokenDate=? WHERE staffID=?;";
  connection.query(query, [token, today, staffID], function (error, results, fields) {
      if (error) {
          throw error;
      }
      callback(token);
  });
}

app.listen(3000, function () {
    console.log("Listening on port 3000");
});
