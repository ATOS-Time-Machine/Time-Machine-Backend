var jwt = require('jsonwebtoken');
var config = require('./config');
var bcrypt = require('bcrypt-nodejs');

module.exports = {
    authenticate: authenticate,
    add_user: add_user,
    get_staff: get_staff,
    get_profile: get_profile,
    set_profile: set_profile,
    submit_request: submit_request,
    get_review: get_review,
    set_review: set_review,
    get_confrim: get_confrim,
    set_confirm: set_confirm,
    get_process: get_process,
    get_code: get_code
};

function authenticate(connection, req, doneCb) {
    var query = "SELECT Access, Password FROM Users WHERE StaffID=?;";
    var parameters = [req.body.id];
    connection.query(query, parameters, function (error, results) {
        if (!error) {
            var res_token = {
                id: req.body.id,
                admin: results[0].Access
            };
            jwt.sign(res_token, config.secret, {}, function (error, token) {
                if (!error) {
                    if (bcrypt.compareSync(req.body.password, results[0].Password)) {
                        doneCb(null, {
                            token: token,
                            admin: results[0].Access,
                        });
                    } else {
                        doneCb("Failed to auth");
                    }
                }
            });
        } else {
            doneCb(error);
        }
    });
}

function add_user(connection, decoded, req, res) {
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

function get_staff(connection, decoded, req, res) {
    var query = "SELECT * FROM Users WHERE Supervisor=?;";
    connection.query(query, [decoded.id], function (error, results) {
        if (!error) {
            res.json({
                results: results
            });
        }
    });
}

function get_profile(connection, query, das, res) {
    connection.query(query, [das], function (error, results) {
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

function set_profile(connection, query, parameters, res) {
    connection.query(query, parameters, function (error) {
        if (!error) {
            res.json({
                success: true
            });
        }
    });
}

function submit_request(connection, decoded, req, res) {
    var search_query = "SELECT Supervisor FROM Users WHERE StaffID=?";
    connection.query(search_query, [decoded.id], function (error, results) {
        if (!error) {
            var supervisor = results[0].Supervisor;
            var insert_query = "INSERT INTO Requests (StaffID, Contract, Future, RequestDate, RequestTime, Duration, USD, WBS, ReasonFree, OvertimeReason, HoursReason, Rate, Manager, Revenue, Paying, Supervisor, Phase) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
            var parameters = [decoded.id, req.body.contract, req.body.future, req.body.date, req.body.time, req.body.duration, req.body.usd, req.body.wbs, req.body.reason_free, req.body.reason_overtime, req.body.reason_hours, req.body.rate, req.body.manager, req.body.revenue, req.body.paying, supervisor, 1];
            console.log(parameters);
            connection.query(insert_query, parameters, function (error) {
                if (!error) {
                    //send_email(supervisor, "Time Machine [Review]", "<p> There is a new ovetime request which need reviewing. </p>");
                    res.json({
                        success: true
                    });
                }
            });
        }
    });
}

function get_review(connection, decoded, req, res) {
    var query = "SELECT * FROM Requests WHERE Supervisor=? AND Phase = 1";;
    connection.query(query, [decoded.id], function (error, results) {
        if (!error) {
            res.json({
                results: results
            });
        }
    });
}

function set_review(connection, decoded, req, res) {
    var query = "UPDATE Requests SET Status=?, Comment=?, Phase=2 WHERE Supervisor=? AND StaffID=? AND RequestDate=? AND RequestTime=? AND Phase=1;";
    var parameters = [req.body.status, req.body.comment, decoded.id, req.body.das, req.body.date, req.body.time];
    connection.query(query, parameters, function (error) {
        if (!error) {
            //send_email(decoded.id, "Time Machine [Confirm]", "<p> One of you overtime requests has been reviewed, please confirm. </p>");
            res.json({
                success: true
            });
        }
    });
}

function get_confrim(connection, decoded, req, res) {
    var query = "SELECT * FROM Requests WHERE StaffID=? AND Phase = 2";
    connection.query(query, [decoded.id], function (error, results) {
        if (!error) {
            res.json({
                results: results
            });
        }
    });
}

function set_confirm(connection, decoded, req, res) {
    var query = "UPDATE Requests SET Rate=?, RequestDate=?, RequestTime=?, Duration=?, Phase=3 WHERE StaffID=? AND RequestDate=? AND RequestTime=? AND Phase=2;";
    var parameters = [req.body.rate, req.body.newDate, req.body.newTime, req.body.duration, decoded.id, req.body.oldDate, req.body.oldTime];
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

function get_process(connection, decoded, req, res) {
    var query = "SELECT * FROM Requests WHERE StaffID=? AND Phase = 3";
    connection.query(query, [decoded.id], function (error, results) {
        if (!error) {
            res.json({
                results: results
            });
        }
    });
}

function get_code(connection, decoded, req, res) {
    var query = "SELECT WBSCode FROM Codes WHERE StaffID=?";
    connection.query(query, [decoded.id], function (error, results) {
        if (!error) {
            res.json({
                results: results
            });
        }
    });
}
