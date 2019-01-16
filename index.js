const Joi = require("joi");

let dbConnection;

// @todo: orderByCase
// @todo: getLastInsertedId - console.log(result.insertId);
// @todo: subquery
// @todo: transaction
// @todo: logging
// @todo: fulltext

/**
 * Creates the required database connection for the QueryBuilder execute function
 *
 * @param {string} host     	MySQL server host
 * @param {string} user     	MySQL server user
 * @param {string} password 	MySQL server password
 * @param {string} database 	MySQL server database
 */
var DatabaseConnection = function(host, user, password, database) {

	if(host === null) {
		throw new Error("Host cannot be NULL");
	} 
	if(user === null) {
		throw new Error("User cannot be NULL");
	} 
	if(password === null) {
		throw new Error("Password cannot be NULL");
	} 
	if(database === null) {
		throw new Error("Database cannot be NULL");
	}

	dbConnection = mysql.createConnection({
		host: host,
		user: user,
		password: password,
		database: database
	});

	dbConnection.connect(error => {
		if (error !== null) {
			throw error;
		} else {
			console.info("Database connected!");
		}
	});
}

/**
 * QueryBuilder constructor
 *
 * @constructor
 *
 * @param {boolean} [debug=true] - Enables debug, show how the query is pares in the log
 */
var QueryBuilder = function(debug = false) {
	this.query = "";
	this.builder = {
		table: null,
		type: null,
		keys: [],
		values: [],
		where: [],
		limit: {
			offset: null,
			amount: null
		},
		order: []
	};
	this.debug = debug; // Show debug info

	return this;
};

/**
 * Fetch a row from the database
 *
 * @param  {string} 	table 		Name of the table you want to select something from
 * @param  {string[]}  	keys  		The items you want tot select
 * @param  {string[]} 	names 		Key name of the value
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.select = function(table, keys, names) {
	const validation = Joi.validate(
		{ keys, table, names },
		Joi.object().keys({
			table: Joi.string()
				.min(1)
				.required(),
			keys: Joi.array().items(
				Joi.string()
					.min(1)
					.required()
			),
			names: Joi.array()
				.items(Joi.string().min(1))
				.when("keys", { is: keys.length > 1, then: Joi.array().length(keys.length), otherwise: Joi.optional() })
		})
	);

	if (validation.error) {
		console.error(validation.error);
		var _this = this;
		console.log(_this);
		return _this;
	} else {
		this.builder.table = table;
		this.builder.keys = keys;
		this.builder.type = "select";

		return this;
	}
};

/**
 * Adds a row into the database
 *
 * @param  {string} 					table 		Name of the table you want to select something from
 * @param  {object<string,string>}  	values  	The items you want tot insert (key => value object)
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.insert = function(table, values) {
	const validation = Joi.validate(
		{ values, table },
		Joi.object().keys({
			values: Joi.object({}).unknown(),
			table: Joi.string()
				.min(1)
				.required()
		})
	);

	if (validation.error) {
		throw new Error(validation.error);
	} else {
		this.builder.table = table;
		this.builder.keys = Object.keys(values);
		this.builder.values = Object.values(values);
		this.builder.type = "insert";

		return this;
	}
};

/**
 * Update a row in the database
 *
 * @param  {string} 	table 		- Name of the table you want to select something from
 * @param  {string[]}  	keys  		- The items you want tot select
 * @param  {string[]} 	names 		- Key name of the value
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.update = function(keys, table) {
	const validation = Joi.validate(
		{ keys, table },
		Joi.object().keys({
			keys: Joi.array().items(
				Joi.string()
					.min(1)
					.required()
			),
			table: Joi.string()
				.min(1)
				.required()
		})
	);

	if (validation.error) {
		throw new Error(validation.error);
	} else {
		this.builder.table = table;
		this.builder.keys = keys;
		this.builder.type = "update";

		return this;
	}
};

/**
 * Removes a row from the selected table
 *
 * @param  {string}     table   - Name of the table you want to select something from
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.delete = function(table) {
	const validation = Joi.validate(
		{ keys, table },
		Joi.object().keys({
			table: Joi.string()
				.min(1)
				.required()
		})
	);

	if (validation.error) {
		throw new Error(validation.error);
	} else {
		this.builder.table = table;
		this.builder.type = "delete";

		return this;
	}
};

/**
 * Truncates the given table
 *
 * @param  {string}     table   - Name of the table you want to select something from
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.truncate = function(table) {
	const validation = Joi.validate(
		{ keys, table },
		Joi.object().keys({
			table: Joi.string()
				.min(1)
				.required()
		})
	);

	if (validation.error) {
		throw new Error(validation.error);
	} else {
		this.builder.table = table;
		this.builder.type = "truncate";

		return this;
	}
};

/**
 * Adds a where clause to the SQL statement
 * Note: for between and fulltext where clauses use the between() and fulltext() functions
 *
 * @param  {string} 	key      		The key you want to check
 * @param  {string} 	value    		The value you want to check against
 * @param  {string} 	operator		Comparison operator
 * @param  {string} 	type			Type of where clause ('OR','AND')
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.where = function(key, value, operator = "=", type = null) {
	const validation = Joi.validate(
		{ key, value, operator, type },
		Joi.object().keys({
			key: Joi.string().required(),
			value: Joi.any().required(),
			operator: Joi.any().required(),
			type: Joi.any()
				.valid(["OR", "AND", null])
				.required()
		})
	);

	if (validation.error) {
		throw new Error(validation.error);
	} else {
		// Validation
		if (this.builder.where.length > 0 && type === null) {
			throw new Error("Please specify the type of where (OR | AND)");
		}

		if (value === null) {
			if (operator === "=") {
				operator = "IS";
			} else if (operator === "!=") {
				operator = "IS NOT";
			}
		}

		this.builder.where.push({
			key: key,
			value: value,
			operator: operator,
			type: type
		});

		return this;
	}
};

/**
 * Adds a OR clause to the where clause to the SQL statement
 * Note: Should be uses after the where() function to prevent errors
 *
 * @param  {string} 	key      		The key you want to check
 * @param  {string} 	value    		The value you want to check against
 * @param  {string} 	operator		Comparison operator
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.orWhere = function(key, value, operator = "=") {
	return this.where(key, value, operator, "OR");
};

/**
 * Adds a AND clause to the where clause to the SQL statement
 * Note: Should be uses after the where() function to prevent errors
 *
 * @param  {string} 	key      		The key you want to check
 * @param  {string} 	value    		The value you want to check against
 * @param  {string} 	operator		Comparison operator
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.andWhere = function(key, value, operator = "=") {
	return this.where(key, value, operator, "AND");
};

/**
 * Adds a between where clause to the SQL statement
 *
 * @param  {string} 	key      		The key you want to check
 * @param  {int} 	    min    		    The minium value for the given key
 * @param  {int} 	    max		        The maximum value for the given key
 * @param  {string} 	type			Type of where clause ('OR','AND')
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.between = function(key, min, max, type = null) {
	const validation = Joi.validate(
		{ keys, table },
		Joi.object().keys({
			key: Joi.any()
				.valid(this.builder.keys)
				.required(),
			min: Joi.number()
				.integer()
				.required(),
			max: Joi.number()
				.integer()
				.required(),
			type: Joi.any()
				.valid(["OR", "AND", null])
				.required()
		})
	);

	if (validation.error) {
		throw new Error(validation.error);
	} else {
		if (type === null && this.builder.where.length > 0) {
			throw new Error("Please specify the type of the between (OR | AND)");
		}

		this.builder.where.push({
			key: key,
			value: [min, max],
			operator: "BETWEEN",
			type: type
		});

		return this;
	}
};

/**
 * Adds a OR between where clause to the SQL statement
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.orBetween = function(key, min, max) {
	return this.between(key, min, max, "OR");
};

/**
 * Adds a AND between where clause to the SQL statement
 *
 * @param  {string} 	key      		The key you want to check
 * @param  {int} 	    min    		    The minium value for the given key
 * @param  {int} 	    max		        The maximum value for the given key
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.andBetween = function(key, min, max) {
	return this.between(key, min, max, "AND");
};

/**
 * ...
 *
 * @param  {string} 	key      		The key you want to check
 * @param  {int} 	    min    		    The minium value for the given key
 * @param  {int} 	    max		        The maximum value for the given key
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.fulltext = function() {
	console.warn("This function isn't implemented yet!");
	return this;
};

/**
 * ...
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.orFulltext = function() {
	console.warn("This function isn't implemented yet!");
	return this;
};

/**
 * ...
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.andFulltext = function() {
	console.warn("This function isn't implemented yet!");
	return this;
};

/**
 * Add a left join to the SQL query
 *
 * @param  {string} 	table    	The table you want to join
 * @param  {string} 	key      	The key to compare
 * @param  {string} 	value    	The value to compare the key to
 * @param  {string} 	operator	Check operator
 *
 * @return {object} - Current instance of the QueryBuilder
 */

QueryBuilder.prototype.leftJoin = function(table, key, value, operator) {
	const validation = Joi.validate(
		{ keys, table },
		Joi.object().keys({
			key: Joi.any()
				.valid(this.builder.keys)
				.required(),
			min: Joi.number()
				.integer()
				.required(),
			max: Joi.number()
				.integer()
				.required(),
			type: Joi.any()
				.valid(["OR", "AND", null])
				.required()
		})
	);

	if (validation.error) {
		throw new Error(validation.error);
	} else {
		this.builder.joins.push({
			pos: "left",
			table: table,
			key: key,
			value: value,
			operator: operator
		});

		return this;
	}
};

/**
 * ...
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.rightJoin = function() {
	console.warn("This function isn't implemented yet!");
	return this;
};

/**
 * ...
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.innerJoin = function() {
	console.warn("This function isn't implemented yet!");
	return this;
};

/**
 * ...
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.orderBy = function(key, sortOrder = "ASC") {
	const validation = Joi.validate(
		{ key, sortOrder },
		Joi.object().keys({
			key: Joi.string().valid(this.builder.keys),
			sortOrder: Joi.any()
				.valid(["ASC", "DESC"])
				.required()
		})
	);

	if (validation.error) {
		console.error(validation.error);
		throw new Error(validation.error);
	} else {
		this.builder.order.push({
			type: "simple",
			sortOrder: sortOrder,
			key: key
		});

		return this;
	}
};

QueryBuilder.prototype.orderByCase = function() {
	console.warn("This function isn't implemented yet!");
	return this;
};

/**
 * ...
 *
 * @param {int} start - ...
 * @param {int} amount - ...
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.limit = function(offset = 0, amount = 25) {
	const validation = Joi.validate(
		{ offset, amount },
		Joi.object().keys({
			offset: Joi.number()
				.integer()
				.min(0)
				.required(),
			amount: Joi.number()
				.integer()
				.min(1)
				.required()
		})
	);

	if (validation.error) {
		console.error(validation.error);
		throw new Error(validation.error);
	} else {
		this.builder.limit.offset = offset;
		this.builder.limit.amount = amount;

		return this;
	}
};

/**
 * Preps the query for execution
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.prepare = function() {
	var sql = "",
		where = "",
		join = "",
		order = "",
		limit = "";

	// DEBUG
	if (this.debug) {
		console.group("QueryBuilder");
		fns.debug("Builder:", this.builder);
	}

	// Create start of the SQL query
	switch (this.builder.type) {
		case "select":
			sql = "SELECT `" + this.builder.keys.join("`,`") + "` FROM `" + this.builder.table + "`";
			break;
		case "insert":
			sql =
				"INSERT INTO `" +
				this.builder.table +
				"` (`" +
				this.builder.keys.join("`,`") +
				"`) VALUES (" +
				prepValues(this.builder.values) +
				")";

			break;
		case "update":
			sql = "UPDATE `" + this.builder.table + "` SET" + this.builder.keys.join(",");

			break;
		case "delete":
			sql = "DELETE FROM `" + this.builder.table + "`";

			break;
		case "truncate":
			sql = "TRUNCATE `" + this.builder.table + "`";
			break;
		default:
			throw new Error("Unknown action!");
	}

	// DEBUG
	if (this.debug) {
		fns.debug("Query [INIT]", sql);
	}

	// Create array with all the where clauses seperated
	let whereClauses = [];
	this.builder.where.forEach((clause, x) => {
		if (clause.type === null || clause.type === "OR") {
			whereClauses.push([]);
		}
		whereClauses[whereClauses.length - 1].push(clause);
	});

	// Start the creation of the SQL where statement
	if (whereClauses.length > 0) {
		where = "WHERE ";
	}

	// Add all the where clauses to the SQL statement
	whereClauses.forEach((clauses, x) => {
		where += "(";

		let tmp = clauses.map((clause, i) => {
			return "`" + clause.key + "` " + clause.operator + " " + clause.value;
		});
		where += tmp.join(" AND ");

		where += ")";

		if (whereClauses.length - 1 > x) {
			where += " OR ";
		}
	});

	// DEBUG
	if (this.debug) {
		fns.debug("Query [WHERE]", where);
	}

	// Create order
	if (this.builder.order.length > 1) {
		order += "ORDER BY";
		let tmp = this.builder.order.map(order => {
			if (order.type === "simple") {
				return "`" + order.key + "` " + order.sortOrder;
			} else {
				// @todo: impelemnt
				console.warn("Not implemented yet!");
			}
		});
		order += tmp.join(",");
	}

	// DEBUG
	if (this.debug) {
		fns.debug("Query [ORDER]", order);
	}

	// Create limit
	if (this.builder.limit.offset !== null) {
		limit = "LIMIT " + this.builder.limit.offset;
	}
	if (this.builder.limit.amount !== null) {
		if (this.builder.limit.offset === null && this.builder.limit.amount !== null) {
			throw new Error("You can't set an amount without an offset");
		}
		limit += ", " + this.builder.limit.amount;
	}

	// DEBUG
	if (this.debug) {
		fns.debug("Query [LIMIT]", limit);
	}

	// Merge it all toghether
	this.query = [sql, join, where, order, limit].join(" ");

	// DEBUG
	if (this.debug) {
		fns.debug("Query [COMPLETE]", this.query);
		console.groupEnd();
	}

	return this;

	function prepValues(values) {
		for (let i = 0; i < values.length; i++) {
			if (values[i] === null) {
				values[i] = "NULL";
			} else if (typeof values[i] === "string") {
				values[i] = "'" + values[i] + "'";
			}
		}

		return values.join(",");
	}
};

/**
 * Execute callback
 * @callback ExecuteCallback
 * @param {?error} error - Query error
 * @param {?result} result - Query results
 */

/**
 * Executes the query
 *
 * @param {ExecuteCallback} callback -
 *
 * @return {boolean} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.execute = function(callback) {
	if (this.debug) {
		console.log("QueryBuilder - [EXECUTE]", this.query);
	}

	dbConnection.query(this.query, (error, result) => {
		if (typeof callback === "function") {
			callback(error, result);
		} else {
			console.warn("No valid callback was provided ?!");
		}
	});
};

QueryBuilder.prototype.debug() {
	console.group("----------- " + chalk.yellowBright.bold("[DEBUG]") + " -----------");
	for (let i = 0; i < arguments.length; i++) {
		console.warn(arguments[i]);
	}
	console.groupEnd();
	console.log();
}

// Export
module.exports = QueryBuilder;