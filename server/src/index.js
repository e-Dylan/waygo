const express = require('express');
const app = require('./app');

// Users are stored in an sql database
const path = require('path');
const mysql = require('mysql');
const session = require('express-session');
const sqlStore = require('express-mysql-session')(session);

app.use(express.static(path.join(__dirname, 'build')));

// Database connection
const sql_userdb_port = process.env.SQL_USERDB_PORT || 3308;
const mysql_db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3308,
  database: 'waygo',
});

// Connect to mySQL user database
mysql_db.connect((err) => { 
  if (err) {
    console.log('ERROR: database connection error.');
    throw(err);
    return false;
  } else {
    console.log(`Connected to mysql database!`);
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
