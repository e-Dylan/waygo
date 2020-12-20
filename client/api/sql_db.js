const serverlessMySQL = require('serverless-mysql');

var sql_db_port;
var host;
var user;
var password;
var database;

if (process.env.NODE_ENV === 'production') {
	// REMOTE HOST
	sql_db_port = process.env.REACT_APP_DB_PORT
	host = process.env.REACT_APP_DB_HOST
	user = process.env.REACT_APP_DB_USER
	password = process.env.REACT_APP_DB_PASSWORD
	database = process.env.REACT_APP_DB_DATABASE
} else if (process.env.NODE_ENV === 'development') {
	// LOCALHOST:
	sql_db_port = 3308;
	host = 'localhost';
	user = 'root'
	password = 'root'
	database = 'waygo_db';
}

const sql_db = serverlessMySQL({
	config: {
		host: host,
		user: user,
		password: password,
		port: sql_db_port,
		database: database,
	}
})

module.exports = sql_db;