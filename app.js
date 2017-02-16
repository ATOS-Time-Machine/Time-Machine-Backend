#!/usr/bin/env nodejs

const TOKEN_LENGTH = 40;
const TOKEN_EXPIRY_MINS = 20;
const TOKEN_CHECK_FREQUENCY_MS = 60 * 60 * 1000;
const EMAIL_SEND_FREQUENCY_MS = 24 * 60 * 60 * 1000;

var express = require("express");
var bodyParser = require("body-parser");
var bcrypt = require('bcrypt-nodejs');
var randtoken = require('rand-token');
var date = require('date-and-time');
var excelbuilder = require('msexcel-builder');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var app = express();

app.set("json spaces", 4);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// NOTE: Only for local testing
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Setup mysql database config
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "timemachinedb"
});

connection.connect();

//Delete tokens that have been set more than one hour ago
setInterval(function () {
    console.log("Checking for expired tokens");
    
    var query = "UPDATE users SET token=NULL, tokenDate=NULL WHERE TIMESTAMPDIFF(minute, tokenDate, NOW()) > ?;";
    connection.query(query, [TOKEN_EXPIRY_MINS], function (error) {
        if (error) {
            throw error;
        }
    });
}, TOKEN_CHECK_FREQUENCY_MS);  //check every hour

//Check every day whether someone should receive monthly excel thinghy
setInterval(function() {
	console.log("Checking for monthly whatever");

	workbook = generateExcelFile("tmp.xlsx");
	sendMail("arena.cpp@gmail.com", "ssup", "<h1> you've been hacked </h1>", "./reports/tmp.xlsx");
}, EMAIL_SEND_FREQUENCY_MS); //check every day

// Get & post methods go here
app.post("/register", function (req, res) {
    console.log("User attempting to register an account");
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);

    var query = "INSERT INTO users (fullName,staffID,password) VALUES(?,?,?);";
    connection.query(query, [req.body.name, req.body.email, hash], function (error) {
        if (error) {
            throw error;
        }

        generateToken(req.body.email, function (token) {
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
    connection.query(query, [req.body.email], function (error, results) {
        if (error) {
            throw error;
        }
        updateToken(req.body.email, results[0].token, function (token) {
            res.json({
                allow: bcrypt.compareSync(req.body.password, results[0].password),
                token: token
            });
        });
    });
});

function generateToken(staffID, callback) {
    var check = "SELECT token FROM users";
    connection.query(check, function (error, results) {
        var oldToken = false;
        var token;
        do {
            token = randtoken.generate(TOKEN_LENGTH);
            for (var i = 0; i < results.length; i++) {
                oldToken = oldToken || (token === results[i]);
            }
        } while (oldToken);
        updateToken(staffID, token, callback);
    });
}

function updateToken(staffID, token, callback) {
    var today = date.format(new Date(), 'YYYY/MM/DD HH:mm:ss');
    var query = "UPDATE users SET token=?, tokenDate=? WHERE staffID=?;";
    connection.query(query, [token, today, staffID], function (error) {
        if (error) {
            throw error;
        }
        callback(token);
    });
}

//Send a mail
//PS: I had to turn off some security stuff on Gmail
//PPS: It needs nodejs v6.0 or newer (I needed to update)
function sendMail(receiver, subject, message, path){
    var transporter = nodemailer.createTransport(smtpTransport({
   		service: 'Gmail',
   		auth: {
       		user: 'timemachinetest123@gmail.com',
       		pass: 'giorgiorulez'
   		}
	}));

    transporter.sendMail({
   			from: 'timemachinetest123@gmail.com',
   			to: receiver,
   			subject: subject,
   			html: message,
   			attachments: [{path: path}]
	});
}

//You have to execute sudo node app.js, or it won't have permissions to write this file
function generateExcelFile(filename)
{
 	var workbook = excelbuilder.createWorkbook('./reports/', filename);
  
	var sheet1 = workbook.createSheet('sheet1', 1, 4);
	  
	sheet1.set(1, 1, 'You');
	sheet1.set(1, 2, 'Have');
	sheet1.set(1, 3, 'Been');
	sheet1.set(1, 4, 'Hacked');
	  

	workbook.save(function(ok){
		if (!ok) 
		    workbook.cancel();
		else
		    console.log('Workbook saved.');
	});
}

app.listen(3000, function () {
    console.log("Listening on port 3000");
});
