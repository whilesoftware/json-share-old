#!/usr/bin/env node

if (typeof Object.assign != 'function') {
  Object.assign = function(target) {
    'use strict';
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}

'use strict';

const express = require('express');
const MONGO_URL = 'mongodb://db:27017/epg';

var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var request = require('request');
var shortid = require('shortid');
var compression = require('compression');

require('./models/Document');

var db = mongoose.connection;
var Document = mongoose.model('Document');

const PORT = 8080;
const app = express();
app.enable('trust proxy');

app.use('/js', express.static( path.join(__dirname, 'static/js')));
app.use('/css', express.static( path.join(__dirname, 'static/css')));
app.use('/view', express.static( path.join(__dirname, 'static/view')));
app.use('/font', express.static( path.join(__dirname, 'static/font')));
app.use('/img', express.static( path.join(__dirname, 'static/img')));

app.use(compression());
app.use(bodyparser.json());

// make it easy to process url path params by name
app.param('shortid', function(req, res, next, _shortid) {

  var query = Document.findOne({shortid:_shortid});
  req.docid = docid;

  query.exec(function(err, _document) {
    if (err) {
      return next(err);
    }

    if (!_document) {
      return next(new Error('could not find document'));
    }

    req.document = _document;
    return next();
  });
});

app.get('/api/document/:shortid', function(req, res, next) {
  // if we didn't find a station for this stationid, create one right now
  if (req.document == null) {
    return res.status(401).json({message: 'document not found'});
  }

  return res.json(req.document);
});

app.post('/api/document', function(req, res, next) {
  var object_type = typeof(req.body.document);
  if (object_type != 'object') {
    return res.status(400).json({message: 'you must specify an object/array for \'document\''});
  }

  var document = new Document();
  document.data = req.body.document;
  document.timestamp = Date.now();
  document.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  document.shortid = shortid.generate();

  document.save(function(err, new_doc) {
    if (err) {
      return next(err);
    }
    return res.status(200).json(new_doc);
  });
});

app.all('/*', function(req, res, next) {
  res.sendFile( path.join(__dirname, 'static/index.html'));
});

function entrypoint() {
  mongoose.connect(MONGO_URL);
}

var shutdown_exit_code = 0;
function shutdown(signal, value) {
  if (server != null) {
    console.log('server stopped by ' + signal);
    shutdown_exit_code = value;
    server.close(function() {
      mongoose.disconnect();
    });
  }
}

var signals = {
  'SIGINT': 2,
  'SIGTERM': 15
};

var server = null;
db.once('open', function() {
  // we're connected!
  server = app.listen(PORT);
  console.log('Running on http://localhost:' + PORT);

  Object.keys(signals).forEach(function (signal) {
    process.on(signal, function () {
      shutdown(signal, signals[signal]);
    });
  });
});

db.on('error', function() {
  console.error.bind(console, 'connection error:');
  console.log('will try to connect again in 1 second...');
  setTimeout(entryPoint, 1000);
});

db.once('close', function() {
   console.log("db is closed");
   process.exit(128 + shutdown_exit_code);
});

entrypoint();


