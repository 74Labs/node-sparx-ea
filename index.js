var express = require('express');
var app = express();
var cors = require('cors');
var mssql = require('mssql');
var fs = require('fs');

var config = require('./config');

mssql.on('error', err => {
  mssql.close();
})

function errorHandler (err, req, res, next) {
  console.error('error:', err);
  res.status(500);
  res.end(JSON.stringify({ error: err }));
}

var server = app.listen(8888, function () {
    var port = server.address().port;
    console.log('info:', "NodeEA listening at port", port);
});

app.use(cors());

app.get('/diagrams', function (req, res, next) {
  mssql.connect(config.db, function(err) {
    if(err) return next(err);
    var request = new mssql.Request();
    var sql = fs.readFileSync('./sql/diagrams.sql').toString();
    request.query(sql, function(err, data) {
        mssql.close();
        if(err) console.log(err);
        res.end(JSON.stringify(data.recordsets[0]));
    });
  });
});

app.get('/diagrams/:id/', function (req, res, next) {
  mssql.connect(config.db, function(err) {
    if(err) return next(err);
    var request = new mssql.Request();
    var sql = fs.readFileSync('./sql/diagram.sql').toString().replace('%ID%', req.params.id);
    request.query(sql, function(err, data) {
        mssql.close();
        if(err) console.log(err);
        var obj = data.recordsets[0][0];
        obj.nodes = data.recordsets[1];
        obj.nodes.forEach(function(val, idx, arr) {
          arr[idx].properties = Object.assign({}, val);
          arr[idx].labels = [val.type];
          arr[idx].fx = val.x;
          arr[idx].fy = val.y;
        });
        obj.relationships = data.recordsets[2];
        res.end(JSON.stringify(obj));
    });
  });
});

app.use(errorHandler);
