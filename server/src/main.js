const express = require('express');
//const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors'); //-> Switched to volleyball
const volleyball = require('volleyball');
// const bcrypt = require('bcryptjs');
// const Joi = require('joi');
// const monk = require("monk");

// Sql user database requires
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const sql_db = require('./sql_db');


require('dotenv').config();

const middlewares = require('./middlewares');

// Require all api backend serivces (waymessages, users, index.js)
// to be used with express app.
const routes_api = require('./routes/api');

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

///app.use(morgan('dev'));
app.use(helmet());
app.use(cors(corsOptions));
app.use(volleyball);
app.use(express.json());

var sessionStore = new MySQLStore({
  expiration: (1825 * 1000),
  endConnectionOnClose: false,
}, sql_db);

app.use(express.static(path.join(__dirname, 'build')));

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

app.get('/', (req, res) => {
    // serve front-end with this file
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use('/api', routes_api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// Listen to backend api port to receive any requests.
// backend api -> port 1337
const api_port = process.env.API_PORT || 1337;
app.listen(api_port, () => {
    console.log(`Listening: http://localhost:${api_port}, backend api port.`);
});