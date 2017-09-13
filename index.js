var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var mssql = require('mssql');
var fs = require('fs');
var Treeize = require('treeize');

var config = require('./config');

var app = express();
var treeize = new Treeize();

mssql.on('error', err => {
  mssql.close();
})

var server = app.listen(8888, function () {
    var port = server.address().port;
    console.log('info:', "NodeEA listening at port", port);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use(cors());

app.get('/', function (req, res, next) {
  res.end(JSON.stringify({ status: 'online', version: process.env.npm_package_version }))
});

app.get('/api', function (req, res, next) {
  res.end(JSON.stringify(app._router.stack.filter(function(item) {
    return item.path != '';
  })));
})

route(app, 'diagrams', {
  objects: function (data) {
    data.forEach(function(val, idx, arr) {
      arr[idx].properties = Object.assign({}, val);
      arr[idx].labels = [val.type];
      arr[idx].fx = val.x;
      arr[idx].fy = val.y;
    });
    return data;
  },
  connectors: function (data) {
    return data;
  }
});

route(app, 'objects', {
  incoming: function (data) {
    return treeize.grow(data, config.treezie).getData();
  },
  outgoing: function (data) {
    return treeize.grow(data[1], config.treezie).getData();
  }
});

function route(app, name, parsers) {

  app.get('/' + name, function (req, res, next) {
    mssql.connect(config.db, function(err) {
      if(err) return next(err);
      try {
        var sql = fs.readFileSync('./sql/' + name + '/multi.sql').toString();
        var request = new mssql.Request();
        request.input('OFFSET', mssql.Int, req.query.offset ? req.query.offset : 0);
        request.input('LIMIT', mssql.Int, req.query.limit ? req.query.limit : config.defaults.limit);
        request.query(sql, function(err, data) {
          mssql.close();
          if(err) return next(err);
          res.end(JSON.stringify(data.recordsets[0]));
        });
      } catch (err) {
        return next(err);
      } finally {

      }
    });
  });

  Object.keys(parsers).forEach(function(inc) {

    app.get('/' + name + '/:id/' + inc, function (req, res, next) {
      mssql.connect(config.db, function(err) {
        if(err) return next(err);
        var sql = fs.readFileSync('./sql/' + name + '/' + inc + '.sql').toString();
        var request = new mssql.Request();
        request.input('ID', mssql.Int, req.params.id);
        request.query(sql, function(err, data) {
            mssql.close();
            if(err) return next(err);
            var parser = parsers[inc];
            res.end(JSON.stringify(parser(data.recordsets[0])));
        });
      });
    });

  });

  app.get('/' + name + '/:id', function (req, res, next) {
    mssql.connect(config.db, function(err) {
      if(err) return next(err);
      var sql = [fs.readFileSync('./sql/' + name + '/single.sql').toString()];
      var adds = req.query.include ? req.query.include.split(';') : [];
      adds.forEach(function(val, idx) {
        sql[idx + 1] = fs.readFileSync('./sql/' + name + '/' + val + '.sql').toString();
      });
      var request = new mssql.Request();
      request.input('ID', mssql.Int, req.params.id);
      request.query(sql.join(';'), function(err, data) {
          mssql.close();
          if(err) return next(err);
          var obj = data.recordsets[0][0];
          adds.forEach(function(val, idx) {
            var parser = parsers[val];
            obj[val] = parser(data.recordsets[idx + 1]);
          });
          res.end(JSON.stringify(obj));
      });
    });
  });

}

app.use(function (err, req, res, next) {
  console.error('error:', err);
  res.status(500);
  res.end(JSON.stringify({ error: err }));
});
