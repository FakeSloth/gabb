const config = require('./config');
const nef = require('nef');
const nefFs = require('nef-fs');
const nefMongo = require('nef-mongo');

function getDb(name, location) {
  if (name === 'fs') {
    return nef(nefFs(location || 'db'));
  }
  if (name === 'mongo') {
    return nef(nefMongo(location || 'mongodb://localhost:27017/myproject'));
  }
}

module.exports = getDb(config.db.name, config.db.location);
