var assert = require('assert');
var control = require('../control');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var config = require('../config');

//Authentication Unit Test
describe('auth', function() {
    it('Get ID:111 - Success', function(done) {
        var password = "test-password";
        var expectedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        var dummyConn = {
            query: function(q, p, cb) {
                if (p[0] == 111) {
                    cb(null, [{
                        Access: 1,
                        Password: expectedPassword
                    }])
                } else {
                    cb("Wrong ID")
                }
            }
        }
        var req = {
            body: {
                id: 111,
                password: password,
            }
        };
        control.authenticate(dummyConn, req, function(err, profile) {
            if (err) {
                done(err);
                return;
            }
            if (!profile.admin) {
                done("Expected admin rights");
                return;
            }
            jwt.verify(profile.token, config.secret, function (error, decoded) {
                if (err) {
                    done(err);
                    return;
                }
                if (decoded.id != 111) {
                    done("Incorrect token id");
                    return;
                }
                done();
            });
        });
    });
    it('Get wrong ID - Fail', function(done) {
        var password = "test-password";
        var expectedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        var dummyConn = {
            query: function(q, p, cb) {
                if (p[0] == 111) {
                    cb(null, [{
                        Access: 1,
                        Password: expectedPassword
                    }])
                } else {
                    cb("Wrong ID")
                }
            }
        }
        var req = {
            body: {
                id: 1112,
                password: password,
            }
        };
        control.authenticate(dummyConn, req, function(err, profile) {
            if (err) {
                done();
                return;
            }
            done("Shouldn't reach here");
        });
    });
    it('Get ID:111 - Fail password', function(done) {
        var password = "test-password";
        var expectedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        var dummyConn = {
            query: function(q, p, cb) {
                if (p[0] == 111) {
                    cb(null, [{
                        Access: 1,
                        Password: expectedPassword
                    }])
                } else {
                    cb("Wrong ID")
                }
            }
        }
        var req = {
            body: {
                id: 111,
                password: password + "1",
            }
        };
        control.authenticate(dummyConn, req, function(err, profile) {
            if (err) {
                done();
                return;
            }
            done("Shouldn't reach here");
        });
    });
});

// function auth(connection, body, doneCb) {
//     var query = "SELECT Password FROM Users WHERE StaffID=?;";
//     var parameters = [body.id];
//     connection.query(query, parameters, function (error, results) {
//         if (error) {
//             doneCb(error);
//             return;
//         }
//         if (results[0].Name == 'Jimmy') {
//             doneCb(null, "woo");
//             return;
//         }
//         doneCb("Missing jimmy", null);
//     });
// }

// describe('math', function() {
//     describe('math works', function() {
//         it('adding 1 and 1', function () {
//             var result = 1 + 1;
//             assert.equal(result, 2);
//         });
//     });
// });

// describe('auth', function() {
//     it('get jimmy', function(done) {
//         var dummyConn = {
//             query: function(q, p, cb) {
//                 if (p[0] == 55) {
//                     cb(null, [{Name: "Jimmy"}])
//                 } else {
//                     cb("Wrong ID")
//                 }
//             }
//         }
//         auth(dummyConn, {id: 55}, function(err, res) {
//             if (err) {
//                 done(err);
//                 return;
//             }
//             if (res == 'woo') {
//                 done();
//             } else {
//                 done("Missing woo :(")
//             }
//         });
//     });
//     it('get no jimmy', function(done) {
//         var dummyConn = {
//             query: function(q, p, cb) {
//                 if (p[0] == 55) {
//                     cb(null, [{name: "Jimmy"}])
//                 } else {
//                     cb("Wrong ID")
//                 }
//             }
//         }
//         auth(dummyConn, {id: 56}, function(err, res) {
//             if (err) {
//                 done();
//                 return;
//             }
//             done("Should fail");
//         });
//     });
// })