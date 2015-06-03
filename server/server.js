var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    db = mongoose.connection;

mongoose.connect('mongodb://mongo/liow2');

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function() {
    console.log('Connected to mongodb://mongo/liow2');
});

var dummySchema = mongoose.Schema({
    name: String
});
var Dummy = mongoose.model('Dummy', dummySchema);

// accept GET request on the homepage
app.get('/', function(req, res) {
    Dummy.find(function (err, dummies) {
        if (err) return console.error(err);
        res.send('Hello! there are ' + dummies.length + ' dummies.<br>Here they are: ' + dummies);
    });
});

// accept POST request on the homepage
app.post('/', function (req, res) {
    Dummy.find(function (err, dummies) {
        if (err) return console.error(err);
        var dummy = new Dummy({ name: 'dummy' + (dummies.length + 1) });

        dummy.save(function (err, dummy) {
            if (err) return console.error(err);
            res.send('Saved ' + dummy.name);
        });
    });
});

// accept PUT request at /user
app.put('/user', function (req, res) {
    res.send('Got a PUT request at /user');
});

// accept DELETE request at /user
app.delete('/user', function (req, res) {
    res.send('Got a DELETE request at /user');
});

var server = app.listen(3000, function() {
    var host = server.address().address,
        port = server.address().port;

    console.log('Express app listening at http://%s:%s', host, port);
});
