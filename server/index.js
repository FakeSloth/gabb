/**
 * Module dependencies.
 */

const bodyParser = require('body-parser');
const compress = require('compression');
const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const log = require('winston').info;

const config = require('./config');
const routes = require('./routes');
const sockets = require('./sockets');

/**
 * Create Express server.
 */

const app = express();
const server = http.Server(app);

/**
 * Create sockets.
 */

const io = socketio(server);

/**
 * App configuration.
 */

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(compress());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * Routes
 */

app.use('/', routes);

/**
 * Sockets
 */

sockets(io);

server.listen(config.port, err => {
  if (err) console.log(err);
  log('==> Listening on port %s in %s mode.', config.port, app.get('env'));
});
