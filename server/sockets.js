const Immutable = require('immutable');
const winston = require('winston');
const db = require('./db');
const toId = require('toid');

function sockets(io) {
  //store.dispatch({ type: CREATE_ROOM, name: 'Lobby' });

  function connection(socket) {
    new Socket(io, socket);
  }

  io.on('connection', connection);
}

function getIP(socket) {
  const forwarded = socket.request.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded;
  } else {
    return socket.request.connection.remoteAddress;
  }
}

let state = Immutable.Map({
  users: Immutable.Map({}),
  rooms: Immutable.Map({})
});

function setState(newState) {
  state = newState(state);
}

function User(name, socket, authenticated) {
  return Immutable.Map({
    name,
    socket,
    authenticated,
    id: toId(name),
    ip: getIP(socket)
  });
}

function Room(name) {
  return Immutable.Map({
    name,
    id: toId(name),
    users: Immutable.List(),
    log: Immutable.List()
  });
}

class Socket {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;

    this.events = {};
    this.events.disconnect = this.disconnect.bind(this);
    this.events.addUser = this.addUser.bind(this);
    this.events.secret = this.secret.bind(this);

    this.handleEvents(this.events, this.socket);
    this.init();
  }

  init() {
    winston.info(`User ${getIP(this.socket)} connected`);
  }

  handleEvents(events, socket) {
    Object.keys(events).forEach(event => {
      socket.on(event, this.events[event]);
    });
  }

  err(message) {
    this.socket.emit('err', message);
    return true;
  }

  addUser(username) {
    if (typeof username !== 'string') return this.err('Must be a string.');
    const userId = toId(username);
    if (!db.auths.get(userId))
      return this.err('This username has not been authenticated.');
    if (state.getIn(['users', userId]))
      return this.err('Someone is already using that username.');

    this.socket.userId = userId;
    const user = User(username, this.socket);
    setState(state => state.setIn(['users', userId], user));

    winston.log('User added!');

    this.socket.emit('addUser', userId);
    db.auths.remove(userId);
  }

  secret() {
    if (!db.auths.get(this.socket.userId))
      return this.err('This username has not been authenticated.');

    this.socket.emit('secret', 'got secret!');
    db.auths.remove(this.socket.userId);
  }

  disconnect() {
    winston.info(`User ${getIP(this.socket)} disconnected`);
  }
}

module.exports = sockets;
