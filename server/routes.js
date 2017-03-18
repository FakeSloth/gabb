const bcrypt = require('bcrypt-nodejs');
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const toId = require('toid');

const config = require('./config');
const db = require('./db');

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

function parseUser(username) {
  return { username: username.trim(), userId: toId(username) };
}

function isValidFields(res, username, password) {
  if (username.length > 19 || password.length > 100) {
    res.json({ error: 'Username or password is too long.' });
    return false;
  }

  if (password.length < 10) {
    res.json({ error: 'Password must be at least 10 characters long.' });
    return false;
  }

  return true;
}

router.post('/register', (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.json({ error: 'No username or password.' });
  }

  const { username, userId } = parseUser(req.body.username);

  if (!isValidFields(res, username, req.body.password)) return;

  if (db.users.get(userId)) {
    return res.json({ error: 'Someone has already registered this username.' });
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return res.json({ error: 'Salt failed.' });
    bcrypt.hash(req.body.password, salt, null, (err, hash) => {
      if (err) return res.json({ error: 'Hash failed.' });

      db.users.set(userId, { username, hash });
      db.auths.set(userId, true);
      const token = jwt.sign({ username }, config.jwtSecret, {
        expiresIn: '1d'
      });
      res.json({ token });
    });
  });
});

router.post('/login', (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.json({ error: 'No username or password.' });
  }

  const { username, userId } = parseUser(req.body.username);
  if (!isValidFields(res, username, req.body.password)) return;

  const hash = db.users.get(userId).hash;
  bcrypt.compare(req.body.password, hash, (err, isMatch) => {
    if (err) return res.json({ error: 'Compare failed.' });
    if (!isMatch) return res.json({ error: 'Invalid password.' });

    db.auths.set(userId, true);
    const token = jwt.sign({ username }, config.jwtSecret, { expiresIn: '1d' });
    res.json({ token });
  });
});

// user wants some auth required info from socket
// socket requests a uid
// user asks socket to give a uid
// user makes a http request with jwt / uid to validate the uid
// user sends uid to socket for auth required info
// socket checks to see if uid is valid, and then throws away the uid

// OR

// user makes http request for a uid w/ jwt
// NOTE: db.auths.set(userId, uid)
// user gives socket uid for secret info
// socket checks uid is valid and then throws it away
// NOTE: db.auths.get(userId) === uid; db.auths.remove(userId)

// OR

// user makes http request to toggle sudo w/ jwt
// user asks for socket to check toggle sudo for secret info
// socket checks toggle sudo and then if true gives secret info and unmark toggle sudo

// NOTE: rename toggle sudo to auths
router.post('/auth', (req, res) => {
  if (!req.body.token) return res.json({ error: 'No token.' });
  jwt.verify(req.body.token, config.jwtSecret, (err, decoded) => {
    const username = decoded.username;
    if (err || !username) return res.json({ error: 'Invalid token.' });
    db.auths.set(toId(username), true);
    res.json({ username });
  });
});

module.exports = router;
