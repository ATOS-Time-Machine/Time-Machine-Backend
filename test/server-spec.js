var assert = require('assert');

function auth(connection, body, doneCb) {
    var query = "SELECT Password FROM Users WHERE StaffID=?;";
    var parameters = [body.id];
    connection.query(query, parameters, function (error, results) {
        if (error) {
            doneCb(error);
            return;
        }
        if (results[0].Name == 'Jimmy') {
            doneCb(null, "woo");
            return;
        }
        doneCb("Missing jimmy", null);
    });
}

describe('math', function() {
    describe('math works', function() {
        it('adding 1 and 1', function () {
            var result = 1 + 1;
            assert.equal(result, 2);
        });
    });
});

describe('auth', function() {
    it('get jimmy', function(done) {
        var dummyConn = {
            query: function(q, p, cb) {
                if (p[0] == 55) {
                    cb(null, [{Name: "Jimmy"}])
                } else {
                    cb("Wrong ID")
                }
            }
        }
        auth(dummyConn, {id: 55}, function(err, res) {
            if (err) {
                done(err);
                return;
            }
            if (res == 'woo') {
                done();
            } else {
                done("Missing woo :(")
            }
        });
    });
    it('get no jimmy', function(done) {
        var dummyConn = {
            query: function(q, p, cb) {
                if (p[0] == 55) {
                    cb(null, [{name: "Jimmy"}])
                } else {
                    cb("Wrong ID")
                }
            }
        }
        auth(dummyConn, {id: 56}, function(err, res) {
            if (err) {
                done();
                return;
            }
            done("Should fail");
        });
    });
})