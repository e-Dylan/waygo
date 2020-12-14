const express = require('express');
// const morgan = require('morgan'); -> Switched to volleyball
// const helmet = require('helmet');
// const cors = require('cors');
// const volleyball = require('volleyball');
// const bcrypt = require('bcryptjs');
// const Joi = require('joi');
// const monk = require("monk");

// Sql user database requires
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const sql_db = require('./sql_db');


require('dotenv').config();

// const middlewares = require('./middlewares');

const app = express();

const origin = process.env.NODE_ENV === "production" ? process.env.REACT_APP_PRODUCTION_URL : process.env.REACT_APP_DEVELOPMENT_URL
const corsOptions = {
  origin: origin,
  credentials: true,
};

// middlewares

///app.use(morgan('dev'));
// app.use(helmet());
// app.use(cors(corsOptions));
// app.use(volleyball);
app.use(express.json());

var sessionStore = new MySQLStore({
	expiration: (1800), // 15 minutes (in seconds)
	endConnectionOnClose: false,
}, sql_db);

app.use(session({
	secret: process.env.REACT_APP_SESSION_SECRET,
	store: sessionStore,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: (1800),
		httpOnly: false,
		secure: false,
	}
}));

// app.get('/', (req, res) => {
//     // serve front-end with this file
// 	res.send("Served '/' on main app /api. ");
// });

module.exports = app;