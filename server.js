#!/usr/bin/env nodejs
var express = require("express");
var bodyParser = require("body-parser");
var bcrypt = require('bcrypt-nodejs');

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
    password: "",
    database: "timemachine"
});

connection.connect();

// Get & post methods go here
app.post("/adduser", function (req, res) {
    console.log("Adding a new user");
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.user_password, salt);
    var query = "INSERT INTO Users (StaffID, FirstName, LastName, Password, PayRoll, Location, Email, Alerts, Role, Access, Supervisor) VALUES(?,?,?,?,?,?,?,?,?,?,?);";
    connection.query(query, [req.body.user_das, req.body.user_first_name, req.body.user_last_name, hash, req.body.user_pay_roll, req.body.user_location, req.body.user_email, req.body.user_alerts, req.body.user_role, req.body.user_access, req.body.supervisor], function (error) {
        if (error) {
            throw error;
        } else {
            res.json({
                success: true
            });
        }
    });
});

app.post("/login", function (req, res) {
    console.log("Logging in");
    var query = "SELECT Password FROM Users WHERE StaffID=111;";
    connection.query(query, function (error, results) {
        if (error) {
            throw error;
        } else {
            if (req.body.log_password === "111") {
                res.json({
                    success: (req.body.log_password === results[0].Password),
                    token: req.body.log_id
                });
            } else {
                res.json({
                    success: bcrypt.compareSync(req.body.log_password, results[0].Password),
                    token: req.body.log_id
                });
            }
        }
    });
});

app.get("/profile/:das", function (req, res) {
    var query = "SELECT * FROM Users WHERE StaffID=?;";
    connection.query(query, [req.params.das], function (error, results) {
        if (error) {
            throw error;
        } else {
            res.json({
                results: results[0]
            });
        }
    });
});

app.post("/profile/", function (req, res) {
    var query = "UPDATE Users SET FirstName=?, LastName=?, PayRoll=?, Location=?, Email=?, Alerts=?, Role=? WHERE StaffID=?;";
    connection.query(query, [req.body.profile_first_name, req.body.profile_last_name, req.body.profile_pay_roll, req.body.profile_location, req.body.profile_email, req.body.profile_alerts, req.body.profile_role], function (error, results) {
        if (error) {
            throw error;
        } else {
            res.json({
                success: true
            });
        }
    });
});

app.post("/request", function (req, res) {
    console.log("Processing an overtime request");
    var query = "INSERT INTO Requests (StaffID, Contract, Future, RequestDate, RequestTime, Duration, USD, WBS, ReasonFree, OvertimeReason, HoursReason, Rate, Manager, Revenue, Paying, Supervisor, Phase) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
    connection.query(query, [req.body.das, req.body.request_contract, req.body.request_future, req.body.request_date, req.body.request_time, req.body.request_duration, req.body.request_usd, req.body.request_wbs, req.body.request_reason_free, req.body.request_reason_overtime, req.body.request_reason_hours, req.body.request_rate, req.body.request_manager, req.body.request_revenue, req.body.request_paying, 111, 1], function (error) {
        if (error) {
            throw error;
        } else {
            res.json({
                success: true
            });
        }
    });
});

app.get("/review/:das", function (req, res) {
    var query = "SELECT * FROM Requests WHERE Supervisor=? AND Phase = 1";
    connection.query(query, [req.params.das], function (error, results) {
        if (error) {
            throw error;
        } else {
            res.json({
                results: results
            });
        }
    });
});

app.post("/review", function (req, res) {
    var query = "UPDATE Requests SET Status=?, Comment=?, Phase=2 WHERE Supervisor=? AND Phase=1;";
    connection.query(query, [req.body.approve_status, req.body.approve_comment, req.body.supervisor], function (error, results) {
        if (error) {
            throw error;
        } else {
            res.json({
                success: true
            });
        }
    });
});

app.get("/present/:das", function (req, res) {
    var query = "SELECT * FROM Requests WHERE StaffID=? AND Phase = 2";
    connection.query(query, [req.params.das], function (error, results) {
        if (error) {
            throw error;
        } else {
            res.json({
                results: results
            });
        }
    });
});

app.post("/present", function (req, res) {
    var query = "UPDATE Requests SET Rate=?, Date=?, Time=?, Duration=?, Phase=3 WHERE Supervisor=? AND Phase=2;";
    connection.query(query, [req.body.das, req.body.actual_rate, req.body.actual_date, req.body.actual_time, req.body.actual_duration], function (error, results) {
        if (error) {
            throw error;
        } else {
            res.json({
                success: true
            });
        }
    });
});

app.listen(3000, function () {
    console.log("Listening on port 3000");
});
