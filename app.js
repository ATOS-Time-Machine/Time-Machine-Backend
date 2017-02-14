#!/usr/bin/env nodejs

var express = require("express");
var bodyParser = require("body-parser");
var bcrypt = require('bcrypt-nodejs');
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
    password: "",
    database: "timemachine"
});

connection.connect();

//GET & POST METHODS GO HERE
app.post("/register", function (req, res) {
    console.log("User attempting to register an account");
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
    var query = "INSERT INTO users (name,email,password) VALUES(?,?,?);";
    connection.query(query, [req.body.name, req.body.email, hash], function (error, results, fields) {
        if (error) {
            throw error;
        }
    });
});

app.post("/login", function (req, res) {
    console.log("User attempting to login");
    var query = "SELECT password FROM users WHERE email=?;";
    connection.query(query, [req.body.email], function (error, results, fields) {
        if (error) {
            throw error;
        }
        //alert(bcrypt.compareSync(req.body.password, results[0].password));
        console.log(bcrypt.compareSync(req.body.password,results[0].password));
        //res.send("login="+bcrypt.compareSync(req.body.password,results[0].password)); //need to also add +"token="+tokenGenerate() to this response string
    });
});

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
