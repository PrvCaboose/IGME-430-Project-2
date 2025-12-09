require('dotenv').config();

const path = require('path');
const express = require('express');
const compression = require('compression');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const redis = require('redis');
const cors = require('cors');

const {
  expressCspHeader, NONE, SELF,
} = require('express-csp-header');
const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Connect MongoDB
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost/PlaylistMaker';
mongoose.connect(dbURI).catch((err) => {
  if (err) {
    console.log("Couldn't connect to the database");
    throw err;
  }
});

// Connect redis
const redisClient = redis.createClient({
  url: process.env.REDISCLOUD_URL,
});

redisClient.on('error', (err) => console.log('Redis client error', err));

redisClient.connect().then(() => {
  const app = express();
  app.use(cors());

  app.use(helmet());
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted`)));
  app.use(compression());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(session({
    key: 'sessionid',
    store: new RedisStore({
      client: redisClient,
    }),
    secret: 'Music Is Love',
    resave: false,
    saveUninitialized: false,
  }));

  app.use(expressCspHeader({
    policies: {
      'default-src': [NONE],
      'img-src': [SELF],
    },
  }));

  app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/../views`);

  router(app);

  app.listen(port, (err) => {
    if (err) { throw err; }
    console.log(`Listening on port ${port}`);
  });
});
