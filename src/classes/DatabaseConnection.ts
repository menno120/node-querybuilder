const mysql = require('../../node_modules/mysql');

class DatabaseConnection {
	connection: any = null;

	constructor() {}

	/**
	 * Creates the required database connection for the QueryBuilder execute function
	 *
	 * @param {string} host     	MySQL server host
	 * @param {string} user     	MySQL server user
	 * @param {string} password 	MySQL server password
	 * @param {string} database 	MySQL server database
	 */
	connect = function(host: string, user: string, password: string, database: string) {
		if (host === null) {
			throw new Error('Host cannot be NULL');
		}
		if (user === null) {
			throw new Error('User cannot be NULL');
		}
		if (password === null) {
			throw new Error('Password cannot be NULL');
		}
		if (database === null) {
			throw new Error('Database cannot be NULL');
		}

		this.connection = mysql.createConnection({
			host: host,
			user: user,
			password: password,
			database: database,
			charset: 'utf8mb4'
		});

		this.connection.connect((error: any) => {
			if (error !== null) {
				throw error;
			} else {
				console.info('Database connected!');
			}
		});
	};

	/**
	 * Get the current active database connection
	 *
	 * @return {Object} - MySQL database connection
	 */
	get = function() {
		return this.connection;
	};
}

export default DatabaseConnection;
