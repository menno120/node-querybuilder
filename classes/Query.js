const { QueryBuilder, reference, FULLTEXT_MODE, SORT_ORDER } = require("./QueryBuilder");
const DatabaseConnection = require("./DatabaseConnection");

// Database connection
const _DatabaseConnection = new DatabaseConnection();

/**
 * Constructor
 *
 * @constructor
 *
 * @param  {boolean}    debug - Enable debug mode
 */
var Query = function(debug = false) {
	this.debug = debug;
	this.builder = new QueryBuilder();
};

/**
 * Adds a SELECT statement to the query
 *
 * @param  {string} 	table 			Name of the table you want to select something from
 * @param  {string[]}  	[keys=[]]  		The items you want tot select
 * @param  {string[]} 	[names=[]] 		Key name of the value
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.select = function(table, keys = [], names = []) {
	this.builder = this.builder.select(table, keys, names);
	return this;
};

/**
 * Adds a row into the database
 *
 * @param  {string} 					table 		Name of the table you want to select something from
 * @param  {object<string,string>}  	values  	The items you want tot insert (key => value object)
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.insert = function(table, values) {
	this.builder = this.builder.insert(table, values);
	return this;
};

/**
 * Update a row in the database
 *
 * @param  {string} 					table 	- Name of the table you want to select something from
 * @param  {object<string,string>}  	values  - The items you want tot insert (key => value object)
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.update = function(table, values) {
	this.builder = this.builder.update(table, values);
	return this;
};

/**
 * Removes a row from the selected table
 *
 * @param  {string}     table   - Name of the table you want to select something from
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.delete = function(table) {
	this.builder = this.builder.delete(table);
	return this;
};

/**
 * Truncates the given table
 *
 * @param  {string}     table   - Name of the table you want to select something from
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.truncate = function(table) {
	this.builder = this.builder.truncate(table);
	return this;
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
Query.prototype.count = function(table, key, keyName = "count") {
	this.builder = this.builder.selectFunc(table, key, keyName, "count");
	return this;
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
Query.prototype.avg = function(table, key, keyName = "avg") {
	this.builder = this.builder.selectFunc(table, key, keyName, "avg");
	return this;
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
Query.prototype.sum = function(table, sum, keyName = "sum") {
	this.builder = this.builder.selectFunc(table, sum, keyName, "sum");
	return this;
};

/**
 * Adds a fulltext statement to the SQL query
 *
 * @param  {string} 			index      			The fulltext index you want to check, example: 'title,body'
 * @param  {string} 			value    			The keywords to search for
 * @param  {FULLTEXT_MODE} 	    mode		    	The fulltext mode (NATURAL LANGUAGE or BOOLEAN)
 * @param  {string}				[keyName=score]		Name of the key
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.fulltext = function(index, value, mode, keyName = "score") {
	this.builder = this.builder.fulltext(index, value, mode, keyName);
	return this;
};

/**
 * Adds a where clause to the SQL statement
 *
 * @param  {string} 	key      		    The key you want to check
 * @param  {string} 	value    		    The value you want to check against
 * @param  {string} 	[operator="="]		Comparison operator
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.where = function(key, value, operator = "=") {
	this.builder = this.builder.where(key, value, operator, null);
	return this;
};

/**
 * Adds a OR clause to the where clause to the SQL statement
 * Note: Can only be uses after the where() function
 *
 * @param  {string} 	key      		    The key you want to check
 * @param  {string} 	value    		    The value you want to check against
 * @param  {string} 	[operator="="]		Comparison operator
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.orWhere = function(key, value, operator = "=") {
	this.builder = this.builder.where(key, value, operator, "OR");
	return this;
};

/**
 * Adds a AND clause to the where clause to the SQL statement
 * Note: Can only be uses after the where() function
 *
 * @param  {string} 	key      		    The key you want to check
 * @param  {string} 	value    		    The value you want to check against
 * @param  {string} 	[operator="="]		Comparison operator
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.andWhere = function(key, value, operator = "=") {
	this.builder = this.builder.where(key, value, operator, "AND");
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
Query.prototype.whereFulltext = function(key, value, mode) {
	this.builder = this.builder.whereFulltext(key, value, mode, null);
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
Query.prototype.orWhereFulltext = function(key, value, mode) {
	this.builder = this.builder.whereFulltext(key, value, mode, "OR");
	return this;
};

/**
 * Adds a fulltext where statement to the SQL query
 *
 * @param  {string} 			key      		The key you want to check, example: 'title,body'
 * @param  {string} 			value    		The keywords to search for
 * @param  {FULLTEXT_MODE} 	    mode		    The fulltext mode (NATURAL LANGUAGE or BOOLEAN)
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.andWhereFulltext = function(key, value, mode) {
	this.builder = this.builder.whereFulltext(key, value, mode, "AND");
	return this;
};

/**
 * Adds a between where clause to the SQL statement
 *
 * @param  {string} 	key      		The key you want to check
 * @param  {int} 	    min    		    The minium value for the given key
 * @param  {int} 	    max		        The maximum value for the given key
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.whereBetween = function(key, min, max) {
	this.builder = this.builder.whereBetween(key, min, max, null);
	return this;
};

/**
 * Adds a OR between where clause to the SQL statement
 *
 * @param  {string} 	key      		The key you want to check
 * @param  {int} 	    min    		    The minium value for the given key
 * @param  {int} 	    max		        The maximum value for the given key
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.orWhereBetween = function(key, min, max) {
	this.builder = this.builder.whereBetween(key, min, max, "OR");
	return this;
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
Query.prototype.andWhereBetween = function(key, min, max) {
	this.builder = this.builder.whereBetween(key, min, max, "AND");
	return this;
};

/**
 * Adds a left join to the SQL query
 *
 * @param  {string} 	table    			The table you want to join
 * @param  {string} 	key      			The key to compare
 * @param  {string} 	value    			The value to compare the key to
 * @param  {string} 	[operator = '=']	Check operator
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.leftJoin = function(table, key, value, operator = "=") {
	this.builder = this.builder.join(table, key, value, operator, "left");
	return this;
};

/**
 * Adds a right join to the SQL query
 *
 * @param  {string} 	table    			The table you want to join
 * @param  {string} 	key      			The key to compare
 * @param  {string} 	value    			The value to compare the key to
 * @param  {string} 	[operator = '=']	Check operator
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.rightJoin = function(table, key, value, operator = "=") {
	this.builder = this.builder.join(table, key, value, operator, "right");
	return this;
};

/**
 * Adds a inner join to the SQL query
 *
 * @param  {string} 	table    			The table you want to join
 * @param  {string} 	key      			The key to compare
 * @param  {string} 	value    			The value to compare the key to
 * @param  {string} 	[operator = '=']	Check operator
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.innerJoin = function(table, key, value, operator = "=") {
	this.builder = this.builder.join(table, key, value, operator, "inner");
	return this;
};

/**
 * Limits the amount of data the database should return
 *
 * @param {int} [offset=0] - Start returning from this point
 * @param {int} [amount=25] - The amount of items that should be returned
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.limit = function(offset = 0, amount = 25) {
	this.builder = this.builder.limit(offset, amount);
	return this;
};

/**
 * Orders the results by the given key
 *
 * @param  {string} key 					- The key to order by
 * @param  {string} [sortOrder = 'ASC'] 	- The order to sort in 'ASC' or 'DESC'
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.orderBy = function(key, sortOrder = "ASC") {
	this.builder = this.builder.orderBy(key, sortOrder);
	return this;
};

/**
 * Adds a subquery to the SQL query
 *
 * @param  {QueryBuilder} 	queryBuilder 			New instance of the QueryBuilder to
 * @param  {string}			[keyName="result"]		Name of the results of the sub query
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.subQuery = function(queryBuilder, keyName = "result") {
	this.builder = this.builder.subQuery(queryBuilder, keyName);
	return this;
};

/**
 * Adds the given SQL query to the QueryBuilder
 * Note: requires the database connection to be setup via the DatabaseConnection.connect() function
 *
 * @param  {string}			sql 		- SQL Query
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.raw = function(sql, callback) {
	this.builder = this.builder.raw(sql, callback);
	return this;
};

/**
 * Prepares the Query for execution
 *
 * @return {object} - Current instance of the QueryBuilder
 */
Query.prototype.prepare = function() {
	this.builder = this.builder.prepare(this.debug);
	return this;
};

/**
 * Executes the SQL Query
 *
 * @returns {Promise} - Promise containing the results
 */
Query.prototype.execute = function() {
	return new Promise(function(resolve, reject) {
		dbConnection.get().query(this.builder.query, (err, data) => {
			if (err === null) {
				resolve(data);
			} else {
				reject(err);
			}

			/*
            if (typeof callback === "function") {
                callback(error, result);
            } else {
                console.warn("No valid callback was provided ?!");
            }
            */
		});
	});
};

/**
 * Shortcut for prepare().execute()
 *
 * @returns {Promise} - Promise containing the results
 */
Query.prototype.go = function() {
	this.builder = this.builder.prepare();
	return this.builder.execute();
};

module.exports = {
	QueryBuilder: Query,
	DatabaseConnection: _DatabaseConnection,
	reference: reference,
	FULLTEXT_MODE: FULLTEXT_MODE,
	SORT_ORDER: SORT_ORDER
};
