#!/usr/bin/env nodejs

var express = require("express");
var bodyParser = require("body-parser");
var bcrypt = require('bcrypt-nodejs');
var randtoken = require('rand-token');
var date = require('date-and-time');

//UPDATE users SET token=NULL, tokenDate=NULL WHERE TIMESTAMPDIFF(minute, tokenDate, NOW()) > 60;

var app = express();

app.set("json spaces", 4);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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

var interval = setInterval(function() {
  	console.log("Checking for expired tokens");
  	//Delete tokens that have been set more than one hour ago
	var query = "UPDATE users SET token=NULL, tokenDate=NULL WHERE TIMESTAMPDIFF(minute, tokenDate, NOW()) > ?;";
	connection.query(query, [20], function (error, results, fields) {
	    	if (error) {
	        	throw error;
	    	}
		});
	}, 60000);  //check every hour


//GET & POST METHODS GO HERE
app.post("/register", function (req, res) {
    console.log("User attempting to register an account");
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
    var token = randtoken.generate(16);
    var today = date.format(new Date(), 'YYYY/MM/DD HH:mm:ss');

    var query = "INSERT INTO users (fullName,staffID,password,token,tokenDate) VALUES(?,?,?,?,?);";
    connection.query(query, [req.body.name, req.body.email, hash, token, today], function (error, results, fields) {
        if (error) {
            throw error;
        }
    res.json({token: token, user: req.body.email});
    //Idk how to handle it in the frontend though
    });
});

app.post("/login", function (req, res) {
    console.log("User attempting to login");
    var query = "SELECT password FROM users WHERE staffID=?;";
    connection.query(query, [req.body.email], function (error, results, fields) {
        if (error) {
            throw error;
        }
        //alert(bcrypt.compareSync(req.body.password, results[0].password));
        console.log(bcrypt.compareSync(req.body.password,results[0].password));
        //res.send("login="+bcrypt.compareSync(req.body.password,results[0].password)); //need to also add +"token="+tokenGenerate() to this response string
    	updateTokenDate(req.body.email);
    });
});

//You can call this every time a user does a request
function updateTokenDate(staffID)
{
	var token = randtoken.generate(16);
	var today = date.format(new Date(), 'YYYY/MM/DD HH:mm:ss');

	var query = "UPDATE users SET token=?, tokenDate=? WHERE staffID=?;";
	connection.query(query, [token, today, staffID], function (error, results, fields) {
	    if (error) {
	        throw error;
	    }
	});
}

app.listen(3000, function () {
    console.log("Listening on port 3000");
});

// app.get("/name/:name", function (req, res) {
//     res.json({
//         name: req.params.name
//     });
// });
//
// app.post("/name", function (req, res) {
//     res.json({
//         name: req.body.name
//     });
// });
//
// var crypto = require('crypto');

/** Sync */
// function generateRandomToken(size) {
//   return crypto.randomBytes(size).toString('hex');
// }
//
// app.get("/test", function (req, res) {
//     res.json({
//         token: generateRandomToken(40)
//     });
// });
//
// var bcrypt = require('bcrypt-nodejs'); //you'll need to change this if you're using bcrypt instead of bcrypt-nodejs
//
// app.get("/test/:name", function (req, res) {
//     var salt = bcrypt.genSaltSync(10);
//     var hash = bcrypt.hashSync(req.params.name, salt);
//     res.json({
//         match: bcrypt.compareSync("password", hash)
//     });
// });

// setInterval(function () {
//     //console.log("wolo"); handle expiration stuff here
// }, 1000);
