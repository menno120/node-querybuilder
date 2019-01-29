const mysql = require("mysql");

/*
class DatabaseConnection {
	constructor() {
		this.connection = null;
	}
}
*/

/**
 * DatabaseConnection constructor
 *
 * @constructor
 */
var DatabaseConnection = function() {
	this.connection = null;
};

/**
 * Get the current active database connection
 *
 * @return {Object} - MySQL database connection
 */
DatabaseConnection.prototype.get = function() {
	return this.connection;
};

/**
 * Creates the required database connection for the QueryBuilder execute function
 *
 * @param {string} host     	MySQL server host
 * @param {string} user     	MySQL server user
 * @param {string} password 	MySQL server password
 * @param {string} database 	MySQL server database
 */
DatabaseConnection.prototype.connect = function(
	host,
	user,
	password,
	database
) {
	if (host === null) {
		throw new Error("Host cannot be NULL");
	}
	if (user === null) {
		throw new Error("User cannot be NULL");
	}
	if (password === null) {
		throw new Error("Password cannot be NULL");
	}
	if (database === null) {
		throw new Error("Database cannot be NULL");
	}

	this.connection = mysql.createConnection({
		host: host,
		user: user,
		password: password,
		database: database
	});

	this.connection.connect(error => {
		if (error !== null) {
			throw error;
		} else {
			console.info("Database connected!");
		}
	});
};

module.exports = DatabaseConnection;
