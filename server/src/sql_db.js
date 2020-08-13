const mysql = require('mysql');

// Database connection
const sql_db_port = process.env.SQL_DB_PORT || 3308;
const sql_db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  port: sql_db_port,
  database: 'waygo_db',
}); 

// Connect to mySQL user database
sql_db.connect((err) => { 
  if (err) {
    console.log('ERROR: database connection error.');
    throw(err);
    return false;
  } else {
    console.log(`Connected to mysql database for users`);
  }
});

module.exports = sql_db;