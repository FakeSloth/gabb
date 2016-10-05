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
  text: 'string',
  room: 'string'
});

let rooms = [
  'Lobby'
];

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.emit('load rooms', rooms);
  rooms.forEach(room => socket.join(room));

  socket.on('chat message', (buffer) => {
    const messageObject = messageSchema.decode(buffer);
    const text = messageObject.text;
    if (text.substr(0, 5) === '/join') {
      const parts = text.split(' ');
      console.log(parts);
      socket.join(parts[1]);
      socket.emit('join room', parts[1]);
    } else {
      io.to(messageObject.room).emit('chat message', buffer);
    }
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

const port = process.env.PORT || 3000;
server.listen(port, (err) => {
  if (err) console.log(err);
  console.log('==> Listening on port %s in %s mode.', port, app.get('env'));
});
