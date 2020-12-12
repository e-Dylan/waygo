// const mysql = require('mysql');

// const deploy = 'remote';

// var sql_db_port;
// var host;
// var user;
// var password;
// var database;

// if (deploy === 'remote') {
// 	// REMOTE HOST
// 	sql_db_port = 3306;
// 	host = 'sql9.freemysqlhosting.net';
// 	user = 'sql9380874';
// 	password = 'UenAiZQTdp';
// 	database = 'sql9380874';
// } else if (deploy === 'localhost') {
// 	// LOCALHOST:
// 	sql_db_port = process.env.SQL_DB_PORT || 3308;
// 	host = 'localhost';
// 	user = 'root'
// 	password = 'root'
// 	database = 'waygo_db';
// }

// // Database connection
// const sql_db = mysql.createConnection({
//   host: host,
//   user: user,
//   password: password,
//   port: sql_db_port,
//   database: database,
// }); 

// // Connect to mySQL user database
// sql_db.connect((err) => { 
//   if (err) {
//     console.log('ERROR: database connection error.');
//     throw(err);
//     return false;
//   } else {
//     console.log(`Connected to mysql database for users`);
//   }
// });



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