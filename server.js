#!/usr/bin/env nodejs

// ========================
// ====== Packages ========
// ========================
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var bcrypt = require('bcrypt-nodejs');
var mysql = require("mysql");
var jwt = require('jsonwebtoken');
var config = require('./config');

// ========================
// ==== Configuration =====
// ========================

// Set up the MySQL database
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: config.password,
    database: config.database
});
connection.connect();

// Express options
app.set('secret', config.secret);
app.set("json spaces", 4);

// Use body parser to get information from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// NOTE: Only for local testing
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// ========================
// ======== Routes ========
// ========================

// Basic Route
app.get('/', function (req, res) {
    res.send('Hello! The API is at /api');
});

// Route to authenticate user
app.post("/authenticate", function (req, res) {
    console.log("Authenticating crendentials")
    var query = "SELECT Password FROM Users WHERE StaffID=?;";
    var parameters = [req.body.id];
    connection.query(query, parameters, function (error, results) {
        if (!error) {
            jwt.sign(req.body, config.secret, {}, function (error, token) {
                if (!error) {
                    if (bcrypt.compareSync(req.body.password, results[0].Password)) {
                        res.json({
                            success: true,
                            token: token
                        });
                    } else {
                        res.json({
                            success: false
                        });
                    }
                }
            });
        }
    });
});

// Route to add a new user
app.post("/adduser", function (req, res) {
    console.log("Adding a new user");
    jwt.verify(req.body.token, config.secret, function (error, decoded) {
        if (!error) {
            var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
            var query = "INSERT INTO Users (StaffID, FirstName, LastName, Password, PayRoll, Location, Email, Alerts, Role, Access, Supervisor) VALUES(?,?,?,?,?,?,?,?,?,?,?);";
            var parameters = [req.body.das, req.body.first_name, req.body.last_name, hash, req.body.pay_roll, req.body.location, req.body.email, req.body.alerts, req.body.role, req.body.access, decoded.id];
            connection.query(query, parameters, function (error) {
                if (!error) {
                    res.json({
                        success: true
                    });
                }
            });
        }
    });
});

// Route to get list of staff under the supervisor
app.get("/staff/:token", function (req, res) {
    console.log("Getting a list of staff");
    jwt.verify(req.params.token, config.secret, function (error, decoded) {
        if (!error) {
            var query = "SELECT * FROM Users WHERE Supervisor=?;";
            connection.query(query, [decoded.id], function (error, results) {
                if (!error) {
                    res.json({
                        results: results
                    });
                }
            });
        }
    });
});


// Route to view the profile of a user
app.get("/profile/:token", function (req, res) {
    console.log("Getting profile information");
    console.log(req.params.token);
    jwt.verify(req.params.token, config.secret, function (error, decoded) {
        var query = "SELECT * FROM Users WHERE StaffID=?";
        if (!error) {
            connection.query(query, [decoded.id], function (error, results) {
                if (!error) {
                    console.log(results);
                    res.json({
                        results: results[0]
                    });
                } else {
                    console.log(error);
                }
            });
        } else {
            console.log(req.params.token);
            connection.query(query, [req.params.token], function (error, results) {
                if (!error) {
                    console.log(results);
                    res.json({
                        results: results[0]
                    });
                } else {
                    console.log(error);
                }
            });
        }
    });
});

// Route to update the profile of a user
app.post("/profile", function (req, res) {
    console.log("Updating user profile");
    jwt.verify(req.body.token, config.secret, function (error, decoded) {
        var query = "UPDATE Users SET FirstName=?, LastName=?, PayRoll=?, Location=?, Email=?, Alerts=?, Role=? WHERE StaffID=?;";
        if (!error) {  
            var parameters = [req.body.first_name, req.body.last_name, req.body.pay_roll, req.body.location, req.body.email, req.body.alerts, req.body.role, decoded.id];
            connection.query(query, parameters, function (error) {
                if (!error) {
                    res.json({
                        success: true
                    });
                }
            });
        } else {
            var parameters = [req.body.first_name, req.body.last_name, req.body.pay_roll, req.body.location, req.body.email, req.body.alerts, req.body.role, req.body.token];
            connection.query(query, parameters, function (error) {
                if (!error) {
                    res.json({
                        success: true
                    });
                }
            });
        }
    });
});

// Route to submit an overtime request
app.post("/request", function (req, res) {
    console.log("Submitting an overtime request");
    jwt.verify(req.body.token, config.secret, function (error, decoded) {
        if (!error) {
            var search_query = "SELECT Supervisor FROM Users WHERE StaffID=?";
            connection.query(search_query, [decoded.id], function (error, results) {
                if (!error) {
                    var supervisor = results[0].Supervisor;
                    var insert_query = "INSERT INTO Requests (StaffID, Contract, Future, RequestDate, RequestTime, Duration, USD, WBS, ReasonFree, OvertimeReason, HoursReason, Rate, Manager, Revenue, Paying, Supervisor, Phase) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
                    var parameters = [decoded.id, req.body.contract, req.body.future, req.body.date, req.body.time, req.body.duration, req.body.usd, req.body.wbs, req.body.reason_free, req.body.reason_overtime, req.body.reason_hours, req.body.rate, req.body.manager, req.body.revenue, req.body.paying, supervisor, 1];
                    console.log(parameters);
                    connection.query(insert_query, parameters, function (error) {
                        if (!error) {
                            res.json({
                                success: true
                            });
                        }
                    });
                }
            });
        }
    });
});

// Route to get overtime requests needing reviewing
app.get("/review/:token", function (req, res) {
    console.log("Getting a list of overtime requests to review");
    jwt.verify(req.params.token, config.secret, function (error, decoded) {
        if (!error) {
            var query = "SELECT * FROM Requests WHERE Supervisor=? AND Phase = 1";;
            connection.query(query, [decoded.id], function (error, results) {
                if (!error) {
                    res.json({
                        results: results
                    });
                }
            });
        }
    });
});

// Route to submit an overtime request review
app.post("/review", function (req, res) {
    console.log("Reviewing an overtime request");
    jwt.verify(req.body.token, config.secret, function (error, decoded) {
        if (!error) {
            var query = "UPDATE Requests SET Status=?, Comment=?, Phase=2 WHERE Supervisor=? AND StaffID=? AND RequestDate=? AND RequestTime=? AND Phase=1;";
            var parameters = [req.body.status, req.body.comment, decoded.id, req.body.das, req.body.date, req.body.time];
            connection.query(query, parameters, function (error) {
                if (!error) {
                    res.json({
                        success: true
                    });
                }
            });
        }
    });
});

// Route to get overtime requests needing confirmation
app.get("/present/:token", function (req, res) {
    console.log("Getting a list of overtime requests to confirm");
    jwt.verify(req.params.token, config.secret, function (error, decoded) {
        if (!error) {
            var query = "SELECT * FROM Requests WHERE StaffID=? AND Phase = 2";
            connection.query(query, [decoded.id], function (error, results) {
                if (!error) {
                    res.json({
                        results: results
                    });
                }
            });
        }
    });
});

// Route to submit an overtime request confirmation
app.post("/present", function (req, res) {
    console.log("Confirming an overtime request");
    jwt.verify(req.body.token, config.secret, function (error, decoded) {
        if (!error) {
            var query = "UPDATE Requests SET Rate=?, RequestDate=?, RequestTime=?, Duration=?, Phase=3 WHERE StaffID=? AND RequestDate=? AND RequestTime=? AND Phase=2;";
            var parameters = [req.body.rate, req.body.newDate, req.body.newTime, req.body.duration, decoded.id, req.body.oldDate, req.body.oldTime];
            connection.query(query, parameters, function (error) {
                if (!error) {
                    console.log("hype");
                    res.json({
                        success: true
                    });
                } else {
                    console.log(error);
                }
            });
        }
    });
});

// Need a get request for processed overtime request -> Easy
app.get("/past/:token", function (req, res) {
    console.log("Getting a list of processed overtime requests");
    jwt.verify(req.params.token, config.secret, function (error, decoded) {
        if (!error) {
            var query = "SELECT * FROM Requests WHERE StaffID=? AND Phase = 3";
            connection.query(query, [decoded.id], function (error, results) {
                if (!error) {
                    res.json({
                        results: results
                    });
                }
            });
        }
    });
});

// Need a get request for getting WBS codes -> Easy
app.get("/code/:token", function (req, res) {
    console.log("Getting a list of wbs codes");
    jwt.verify(req.params.token, config.secret, function (error, decoded) {
        if (!error) {
            var query = "SELECT WBSCode FROM Codes WHERE StaffID=?";
            connection.query(query, [decoded.id], function (error, results) {
                if (!error) {
                    res.json({
                        results: results
                    });
                }
            });
        }
    });
});

// Need a post request for posting WBS codes -> Easy
app.post("/code", function (req, res) {
    console.log("Adding a wbs code");
    jwt.verify(req.body.token, config.secret, function (error, decoded) {
        if (!error) {
            var query = "INSERT INTO Codes (StaffID, WBSCode) VALUES(?,?);";
            var parameters = [decoded.id, req.body.code];
            connection.query(query, parameters, function (error) {
                if (!error) {
                    res.json({
                        success: true
                    });
                } else {
                    console.log(error);
                }
            });
        }
    });
});

// Need a get request for team report -> Hard


// Need a get request for special claims form -> Hard


// Need a function to call if email alerts is enabled -> Hard


// Need to restructure this file to accomodate unit tests -> Medium


app.get("/claim/:token/:start/:finish", function (req, res) {
    console.log("Generating a claim");
    res.attachment("staffstuff.csv");
    let data = "";
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 4; col++) {
            data += "col" + col;
            if (col != 3) {
                data += ", ";
            }
        }
        data += "\n";
    }
    res.send(data);
});

app.get("/report/:token/:start/:finish", function (req, res) {
    console.log("Generating a report");
    res.attachment("staffstuff.csv");
    let data = "";
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 4; col++) {
            data += "col" + col;
            if (col != 3) {
                data += ", ";
            }
        }
        data += "\n";
    }
    res.send(data);
});

app.get("/tempcsv", function (req, res) {
    res.attachment("staffstuff.csv");
    let data = "";
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 4; col++) {
            data += "col" + col;
            if (col != 3) {
                data += ", ";
            }
        }
        data += "\n";
    }
    res.send(data);
});


// ========================
// ======== Server ======== 
// ========================
app.listen(3000, function () {
    console.log("Listening on port 3000");
});