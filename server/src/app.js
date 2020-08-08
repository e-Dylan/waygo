// INITIALIZE EXPRESS APP AND APPLY ALL ITS MIDDLEWARES.
// THEN EXPORT THIS INSTANCE OF THE APP AT THE END.
// IMPORT THE EXPRESS APP ELSEWHERE BY REQUIRING THIS FILE.

const express = require('express');
//const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors'); //-> Switched to volleyball
const volleyball = require('volleyball');

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

///app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(volleyball);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄'
  });
});

app.use('/api/', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
