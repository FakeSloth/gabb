let config = {};

config.db = {
  name: process.env.DATABASE || 'fs',
  location: process.env.DATABASE_LOCATION || 'db'
};

config.jwtSecret = process.env.JWT_SECRET || 'super secret';

config.port = process.env.PORT || 3000;

module.exports = config;
