const Joi = require("joi");
const mysql = require("mysql");
const chalk = require("chalk");

class DatabaseConnection {
	constructor() {
		this.connection = null;
	}
}

const operators = {
	comparison: ["=", "<", ">", "<=", ">=", "!=", "<>", "<=>"]
};
const FULLTEXT_MODES = {
	NATURAL_LANGUAGE_MODE: 1,
	BOOLEAN_MODE: 2
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
DatabaseConnection.prototype.connect = function(host, user, password, database) {
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

const dbConnection = new DatabaseConnection();

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
		order: [],
		joins: []
	};
	this.debug = debug; // Show debug info

	return this;
};

/**
 * Fetch a row from the database
 *
 * @param  {string} 	table 			Name of the table you want to select something from
 * @param  {string[]}  	[keys=[]]  		The items you want tot select
 * @param  {string[]} 	[names=[]] 		Key name of the value
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.select = function(table, keys = [], names = []) {
	const validation = Joi.validate(
		{ keys, table, names },
		Joi.object().keys({
			table: Joi.string()
				.min(1)
				.required(),
			keys: Joi.array()
				.items(
					Joi.string()
						.min(1)
						.optional()
				)
				.optional(),
			names: Joi.array()
				.items(Joi.string().min(1))
				.when("keys", {
					is: keys.length > 1,
					then: Joi.array().length(keys.length),
					otherwise: Joi.optional()
				})
		})
	);

	if (validation.error) {
		console.error(validation.error);
		var _this = this;
		console.log(_this);
		return _this;
	} else {
		let tmp_keys = keys.map(key => {
			if (!key.includes(".")) {
				return table + "." + key;
			} else {
				return key;
			}
		});

		this.builder.table = table;
		this.builder.type = "select";

		// @TOOD: add names to keys
		for (let i = 0; i < tmp_keys.length; i++) {
			this.builder.keys.push({ key: tmp_keys[i], as: null, type: "simple" });
		}

		return this;
	}
};

/**
 * Adds
 *
 * @private
 *
 * @param  {string} 	table 		Name of the table you want to select something from
 * @param  {string}  	key  		The key you want to count
 * @param  {string} 	keyName 	The name of the count result
 * @param  {string} 	type 		Type of function (count, avg, sum)
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.selectFunc = function(table, key, keyName, type) {
	const validation = Joi.validate(
		{ table, key, keyName, type },
		Joi.object().keys({
			table: Joi.string()
				.min(1)
				.required(),
			key: Joi.string()
				.min(1)
				.required(),
			keyName: Joi.string()
				.min(1)
				.required(),
			type: Joi.string()
				.valid(["count", "avg", "sum"])
				.required()
		})
	);

	if (validation.error) {
		console.error(validation.error);
		return this;
	} else {
		this.builder.table = table;
		this.builder.keys.push({ key: key, as: keyName, type: type });
		this.builder.type = "select";

		return this;
	}
};

/**
 * Adds a COUNT() selector to the select statement
 *
 * @param  {string} 	table 				Name of the table you want to select something from
 * @param  {string}  	key  				The key you want to count
 * @param  {string} 	[keyName="count"] 	The name of the count result
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.count = function(table, key, keyName = "count") {
	return this.selectFunc(table, key, keyName, "count");
};

/**
 * Adds a AVG() selector to the select statement
 *
 * @param  {string} 	table 				Name of the table you want to select something from
 * @param  {string}  	key  				The key you want to count
 * @param  {string} 	[keyName="avg"] 	The name of the count result
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.avg = function(table, key, keyName = "avg") {
	return this.selectFunc(table, key, keyName, "avg");
};

/**
 * Adds a sum() selector to the select statement
 * Note: this function is not yet automaticly escaped, and doesn't work with joins currently
 *
 * @param  {string} 	table 				Name of the table you want to select something from
 * @param  {string}  	sum  				The expression to sum
 * @param  {string} 	[keyName="sum"] 	The name of the count result
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.sum = function(table, sum, keyName = "sum") {
	return this.selectFunc(table, sum, keyName, "sum");
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
			values: Joi.object(),
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
 * @param  {string} 					table 	- Name of the table you want to select something from
 * @param  {object<string,string>}  	values  - The items you want tot insert (key => value object)
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.update = function(table, values) {
	const validation = Joi.validate(
		{ values, table },
		Joi.object().keys({
			values: Joi.object().required(),
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
		{ table },
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
		{ table },
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
 * Adds a fulltext statement to the SQL query
 *
 * @param  {string} 			index      			The fulltext index you want to check, example: 'title,body'
 * @param  {string} 			value    			The keywords to search for
 * @param  {FULLTEXT_MODES} 	mode		    	The fulltext mode (NATURAL LANGUAGE or BOOLEAN)
 * @param  {string}				[keyName=score]		Name of the key
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.fulltext = function(index, value, mode, keyName = "score") {
	const validation = Joi.validate(
		{ index, value, mode, keyName },
		Joi.object().keys({
			index: Joi.string().required(),
			value: Joi.string().required(),
			mode: Joi.any()
				.valid([FULLTEXT_MODES.NATURAL_LANGUAGE_MODE, FULLTEXT_MODES.BOOLEAN_MODE])
				.required(),
			keyName: Joi.string().required()
		})
	);

	if (validation.error) {
		throw new Error(validation.error);
	} else {
		if (this.builder.type !== "select") {
			throw new Error("Fulltext select is only availible for select queries currently!");
		}

		if (mode === FULLTEXT_MODES.BOOLEAN_MODE) {
			mode = "IN BOOLEAN MODE";
		} else if (mode === FULLTEXT_MODES.NATURAL_LANGUAGE_MODE) {
			mode = "IN NATURAL LANGUAGE MODE";
		} else {
			throw new Error("Can't find the specified mode");
		}

		this.builder.keys.push({
			key: index,
			as: keyName,
			value: value,
			mode: mode,
			operator: "MATCH",
			type: "fulltext"
		});
		this.builder.type = "select";
	}

	return this;
};

/**
 * Adds a where clause to the SQL statement
 * Note: for between and fulltext where clauses use the whereBetween() and whereFulltext() functions
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
			operator: Joi.any()
				.valid(operators.comparison)
				.required(),
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
QueryBuilder.prototype.whereBetween = function(key, min, max, type = null) {
	const validation = Joi.validate(
		{ key, min, max, type },
		Joi.object().keys({
			key: Joi.string().required(),
			min: Joi.number()
				.integer()
				.required(),
			max: Joi.number()
				.integer()
				.greater(Joi.ref("min"))
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
QueryBuilder.prototype.orWhereBetween = function(key, min, max) {
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
QueryBuilder.prototype.andWhereBetween = function(key, min, max) {
	return this.between(key, min, max, "AND");
};

/**
 * Adds a fulltext where statement to the SQL query
 *
 * @param  {string} 			key      		The key you want to check, example: 'title,body'
 * @param  {string} 			value    		The keywords to search for
 * @param  {FULLTEXT_MODES} 	mode		    The fulltext mode (NATURAL LANGUAGE or BOOLEAN)
 * @param  {type}				type			Type of where clause ('OR','AND')
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.whereFulltext = function(key, value, mode, type = null) {
	const validation = Joi.validate(
		{ key, value, mode, type },
		Joi.object().keys({
			key: Joi.string().required(),
			value: Joi.string().required(),
			mode: Joi.any()
				.valid([FULLTEXT_MODES.NATURAL_LANGUAGE_MODE, FULLTEXT_MODES.BOOLEAN_MODE])
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

		if (mode === FULLTEXT_MODES.BOOLEAN_MODE) {
			mode = "IN BOOLEAN MODE";
		} else if (mode === FULLTEXT_MODES.NATURAL_LANGUAGE_MODE) {
			mode = "IN NATURAL LANGUAGE MODE";
		} else {
			throw new Error("Can't find the specified mode");
		}

		this.builder.where.push({
			key: key,
			value: value,
			mode: mode,
			operator: "MATCH",
			type: type
		});
	}

	return this;
};

/**
 * Adds a fulltext where statement to the SQL query
 *
 * @param  {string} 			key      		The key you want to check, example: 'title,body'
 * @param  {string} 			value    		The keywords to search for
 * @param  {FULLTEXT_MODES} 	mode		    The fulltext mode (NATURAL LANGUAGE or BOOLEAN)
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.orWhereFulltext = function(key, value, mode) {
	return this.whereFulltext(key, value, mode, "OR");
};

/**
 * Adds a fulltext where statement to the SQL query
 *
 * @param  {string} 			key      		The key you want to check, example: 'title,body'
 * @param  {string} 			value    		The keywords to search for
 * @param  {FULLTEXT_MODES} 	mode		    The fulltext mode (NATURAL LANGUAGE or BOOLEAN)
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.andWhereFulltext = function(key, value, mode) {
	return this.whereFulltext(key, value, mode, "AND");
};

/**
 * Add a join to the SQL query
 *
 * @param  {string} 	table    	The table you want to join
 * @param  {string} 	key      	The key to compare
 * @param  {string} 	value    	The value to compare the key to
 * @param  {string} 	operator	Check operator
 * @param  {string}		joinType	Type of join (left,right,inner)
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.join = function(table, key, value, operator, joinType) {
	const validation = Joi.validate(
		{ key, table, value, operator, joinType },
		Joi.object().keys({
			table: Joi.string()
				.min(1)
				.required(),
			key: Joi.any().required(),
			value: Joi.any().required(),
			operator: Joi.any()
				.valid(operators.comparison)
				.required(),
			joinType: Joi.string()
				.valid(["left", "right", "inner"])
				.required()
		})

		// .valid(this.builder.keys)
	);

	if (validation.error) {
		this.error(validation.error);
		throw new Error(validation.error);
	} else {
		this.builder.joins.push({
			pos: joinType,
			table: table,
			key: key,
			value: value,
			operator: operator
		});

		return this;
	}
};

/**
 * Add a left join to the SQL query
 *
 * @param  {string} 	table    			The table you want to join
 * @param  {string} 	key      			The key to compare
 * @param  {string} 	value    			The value to compare the key to
 * @param  {string} 	[operator = '=']	Check operator
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.leftJoin = function(table, key, value, operator = "=") {
	return this.join(table, key, value, operator, "left");
};

/**
 * Add a right join to the SQL query
 *
 * @param  {string} 	table    			The table you want to join
 * @param  {string} 	key      			The key to compare
 * @param  {string} 	value    			The value to compare the key to
 * @param  {string} 	[operator = '=']	Check operator
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.rightJoin = function(table, key, value, operator = "=") {
	return this.join(table, key, value, operator, "right");
};

/**
 * Add a inner join to the SQL query
 *
 * @param  {string} 	table    			The table you want to join
 * @param  {string} 	key      			The key to compare
 * @param  {string} 	value    			The value to compare the key to
 * @param  {string} 	[operator = '=']	Check operator
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.innerJoin = function(table, key, value, operator = "=") {
	return this.join(table, key, value, operator, "inner");
};

/**
 * Orders the results by the given key
 *
 * @todo: allow multiple keys
 *
 * @param  {string} key 					- The key to order by
 * @param  {string} [sortOrder = 'ASC'] 	- The order to sort in 'ASC' or 'DESC'
 *
 * @return {object} - Current instance of the QueryBuilder
 */
QueryBuilder.prototype.orderBy = function(key, sortOrder = "ASC") {
	const validation = Joi.validate(
		{ key, sortOrder },
		Joi.object().keys({
			key: Joi.string()
				.min(1)
				.required(), // .valid(this.builder.keys),
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
 * Limits the amount of data the database should return
 *
 * @param {int} offset - Start returning from this point
 * @param {int} amount - The amount of items that should be returned
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
		this.message("Builder:", this.builder);
	}

	// Create start of the SQL query
	switch (this.builder.type) {
		case "select":
			sql =
				"SELECT " +
				this.builder.keys
					.map(key => {
						if (typeof key.type === "undefined" || key.type === "simple") {
							return this.escape(key.key);
						} else if (key.type === "count") {
							return "COUNT(" + this.escape(this.builder.table + "." + key.key) + ") AS " + key.as;
						} else if (key.type === "avg") {
							return "AVG(" + this.escape(this.builder.table + "." + key.key) + ") AS " + key.as;
						} else if (key.type === "sum") {
							return "SUM(" + key.key + ") AS " + key.as;
						} else if (key.type === "fulltext") {
							return "MATCH (" + key.key + ") AGAINST '" + key.value + "' " + key.mode + " AS " + key.as;
						} else if (key.type === "subQuery") {
							return "(" + key.key.prepare().query + ") AS " + key.as;
						} else {
							throw new Error("Unknown select type!");
						}
					})
					.join(",") +
				" FROM " +
				this.escape(this.builder.table);
			break;
		case "insert":
			sql =
				"INSERT INTO " +
				this.escape(this.builder.table) +
				" (" +
				this.builder.keys
					.map(key => {
						return this.escape(key);
					})
					.join(",") +
				") VALUES (" +
				prepValues(this.builder.values) +
				")";

			break;
		case "update":
			let tmp_values = [];

			sql = "UPDATE " + this.escape(this.builder.table) + " SET ";

			for (let i = 0; i < this.builder.keys.length; i++) {
				tmp_values.push(
					this.escape(this.builder.keys[i]) + "=" + this.builder.values[i] // @TOOD: escape
				);
			}

			sql += tmp_values.join(", ");

			break;
		case "delete":
			sql = "DELETE FROM " + this.escape(this.builder.table);

			break;
		case "truncate":
			sql = "TRUNCATE " + this.escape(this.builder.table);
			break;
		default:
			throw new Error("Unknown action!");
	}

	// DEBUG
	if (this.debug) {
		this.message("Query [INIT]", sql);
	}

	let joinClauses = [];

	this.builder.joins.forEach((joinClause, x) => {
		joinClauses.push(
			joinClause.pos.toUpperCase() +
				" JOIN " +
				this.escape(joinClause.table) +
				" ON " +
				(joinClause.key.includes(".")
					? this.escape(joinClause.key)
					: this.escape(joinClause.table + "." + joinClause.key)) +
				" " +
				joinClause.operator +
				" " +
				(joinClause.value.includes(".")
					? this.escape(joinClause.value)
					: this.escape(this.builder.table + "." + joinClause.value)) +
				""
		);
	});

	join = joinClauses.join(" ");

	// DEBUG
	if (this.debug) {
		this.message("Query [JOINS]", join);
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
			if (clause.operator === "MATCH") {
				return "MATCH (" + clause.key + ") AGAINST '" + clause.value + "' " + clause.mode + "";
			} else {
				return (
					this.escape(clause.key) +
					" " +
					clause.operator +
					" " +
					(typeof clause.value === "string" ? "'" + clause.value + "'" : clause.value)
				);
			}
		});
		where += tmp.join(" AND ");

		where += ")";

		if (whereClauses.length - 1 > x) {
			where += " OR ";
		}
	});

	// DEBUG
	if (this.debug) {
		this.message("Query [WHERE]", where);
	}

	// Create order
	if (this.builder.order.length > 0) {
		order += "ORDER BY";
		let tmp = this.builder.order.map(order => {
			if (order.type === "simple") {
				return " " + this.escape(order.key) + " " + order.sortOrder;
			} else {
				// @todo: implement order by case
				throw new Error("Not implemented yet!");
			}
		});
		order += tmp.join(",");
	}

	// DEBUG
	if (this.debug) {
		this.message("Query [ORDER]", order);
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
		this.message("Query [LIMIT]", limit);
	}

	// Merge it all toghether
	this.query = [sql, join, where, order, limit].join(" ");

	// DEBUG
	if (this.debug) {
		this.message("Query [COMPLETE]", this.query);
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
 * Note: request the database connection to be setup via the DatabaseConnection.connect() function
 *
 * @param {ExecuteCallback} callback - Callback function
 */
QueryBuilder.prototype.execute = function(callback) {
	if (this.debug) {
		console.log("QueryBuilder - [EXECUTE]", this.query);
	}

	dbConnection.get().query(this.query, (error, result) => {
		if (typeof callback === "function") {
			callback(error, result);
		} else {
			console.warn("No valid callback was provided ?!");
		}
	});
};

/**
 * Adds a subquery to the SQL query
 *
 * @param  {QueryBuilder} 	queryBuilder 			New instance of the QueryBuilder to
 * @param  {string}			[keyName="result"]		Name of the results of the sub query
 *
 * @param  {ExecuteCallback} 	callback - Callback function
 */
QueryBuilder.prototype.subQuery = function(queryBuilder, keyName = "result") {
	this.builder.keys.push({
		key: queryBuilder,
		as: keyName,
		type: "subQuery"
	});

	return this;
};

/**
 * Executes the query
 * Note: requires the database connection to be setup via the DatabaseConnection.connect() function
 *
 * @param {string}			sql 		- SQL Query
 * @param {ExecuteCallback} callback 	- Callback function
 */
QueryBuilder.prototype.raw = function(sql, callback) {
	if (this.debug) {
		console.log(sql);
	}

	dbConnection.get().query(sql, (error, result) => {
		if (typeof callback === "function") {
			callback(error, result);
		} else {
			console.warn("No valid callback was provided ?!");
		}
	});
};

/**
 * Escaped the given key with a: (`)
 *
 * @private
 *
 * @param  {string} key - Key to escape
 *
 * @return {string}       Escaped key
 */
QueryBuilder.prototype.escape = function(key) {
	try {
		key = key.toString();

		if (key.includes(".") && !key.includes("`.`")) {
			let tmp = key.split(".");
			return "`" + tmp[0] + "`.`" + tmp[1] + "`";
		}

		return "`" + key + "`";
	} catch (e) {
		console.log(key);
		throw new Error(e);
	}
};

/**
 * Show message
 *
 * @private
 */
QueryBuilder.prototype.message = function() {
	console.group("----------- " + chalk.yellowBright.bold("[QueryBuilder]") + " -----------");
	for (let i = 0; i < arguments.length; i++) {
		console.warn(arguments[i]);
	}
	console.groupEnd();
	console.log();
};

/**
 * Show error message
 *
 * @private
 *
 * @param  {string} err - The error message to show
 */
QueryBuilder.prototype.error = function(err) {
	console.log(chalk.bgRed.bold.white("ERROR:"));
	console.error(err);
	console.log();
};

// Export
module.exports = {
	QueryBuilder: QueryBuilder,
	DatabaseConnection: dbConnection,
	FULLTEXT_MODES: FULLTEXT_MODES
};
