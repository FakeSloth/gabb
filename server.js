/**
 * Module dependencies.
 */

const express = require('express');
const http = require('http');
const path = require('path');
const schemapack = require('schemapack');
const socketio = require('socket.io');

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

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

const messageSchema = schemapack.build({
  text: 'string'
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('chat message', (buffer) => {
    io.emit('chat message', buffer);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

server.listen(3000, (err) => {
  if (err) console.log(err);
  console.log('==> Listening on port %s in %s mode.', 3000, app.get('env'));
});
