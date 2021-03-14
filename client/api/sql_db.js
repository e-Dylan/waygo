const serverlessMySQL = require('serverless-mysql');

var sql_db_port;
var host;
var user;
var password;
var database;

if (process.env.NODE_ENV === 'production') {
	// REMOTE HOST
	sql_db_port = 3306;
	host = 'sql5.freemysqlhosting.net';
	user = 'sql5398902';
	password = 'V4wMK3fFvk';
	database = 'sql5398902';
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