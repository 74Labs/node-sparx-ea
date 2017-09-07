var express = require('express');
var app = express();
var cors = require('cors');
var mssql = require('mssql');
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
    var sql = `
      select
      Diagram_ID as id,
      Name as name
      from
      t_diagram
    `;
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
    // request.stream = true;
    // request.on('recordset', columns => {
    //   console.log('recordset');
    // });
    // request.on('row', row => {
    //   console.log('row');
    // })
    // request.on('error', err => {
    //   console.log('error');
    // })
    // request.on('done', result => {
    //   console.log('done');
    // })
    var sql = 'declare @ID int; set @ID = ' + req.params.id + ';';
    sql = sql + `
      select
      Diagram_ID as id,
      Name as name,
      cx as x,
      cy as y,
      Scale as zoom
      from
      t_diagram
      where
      Diagram_ID = @ID;
    `;
    sql = sql + `
    select
    o.Object_ID as id,
    o.Name as name,
    o.Stereotype as type,
    d.RectLeft as x,
    d.RectTop as y,
    d.RectRight - d.RectLeft as w,
    d.RectTop - d.RectBottom as h
    from
    t_diagramobjects d
    join t_object o on o.Object_ID = d.Object_ID
    where
    d.Diagram_ID = @ID;
    `;
    sql = sql + `
    select
    c.Connector_ID as id,
    c.Stereotype as type,
    c.Start_Object_ID as source,
    c.End_Object_ID as target
    from
    t_diagramlinks d
    join t_connector c on c.Connector_ID = d.ConnectorID
    where
    d.DiagramID = @ID
    `;
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
