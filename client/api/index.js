const express = require('express');
//const morgan = require('morgan'); -> Switched to volleyball
// const helmet = require('helmet');
const cors = require('cors'); //
// const volleyball = require('volleyball');
// const bcrypt = require('bcryptjs');
// const Joi = require('joi');
// const monk = require("monk");

// Sql user database requires
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const sql_db = require('./sql_db');


require('dotenv').config();

// const middlewares = require('./middlewares');

// Require all api backend serivces (waymessages, users, index.js)
// to be used with express app.

const router = express.Router();

// Import routers
const users_router = require('./routes/users');
const saved_locations_router = require('./routes/savedLocations');

// Combine routers
router.use('/', users_router);
router.use('/', saved_locations_router);

const app = express();

const origin = process.env.NODE_ENV === "production" ? process.env.REACT_APP_PRODUCTION_URL : process.env.REACT_APP_DEVELOPMENT_URL
const corsOptions = {
  origin: 'http://waygo.vercel.app',
  credentials: true,
};

///app.use(morgan('dev'));
// app.use(helmet());
app.use(cors(corsOptions));
// app.use(volleyball);
app.use(express.json());

var sessionStore = new MySQLStore({
  expiration: (1825 * 1000 * 1000),
  endConnectionOnClose: false,
}, sql_db);

app.use(session({
  secret: "keyboard cat",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: (10000 * 6504 * 1000),
    httpOnly: false,
    secure: false,
  }
}));

// app.get('/', (req, res) => {
//     // serve front-end with this file
// 	res.send("Served '/' on main app /api. ");
// });

app.use('/api', router);

// app.use(middlewares.notFound);
// app.use(middlewares.errorHandler);

// Listen to backend api port to receive any requests.
// backend api -> port 1337
const api_port = 1337;
app.listen(api_port, () => {
    console.log(`Listening: on ${api_port}, backend api port.`);
});
