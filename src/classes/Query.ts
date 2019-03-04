import DatabaseConnection from './DatabaseConnection';
import QueryBuilder, { SelectFunction } from './QueryBuilder';

import { FulltextMode, SortOrder, WhereType, JoinType, reference } from '../helpers';

import Reference from './objects/Reference';
import IKey from '../interfaces/IKey';

class Query {
	debug: boolean = false;
	builder: QueryBuilder;
	databaseConnection: DatabaseConnection = null;

	/**
	 * Constructor
	 *
	 * @constructor
	 *
	 * @param  {boolean}    debug - Enable debug mode
	 */
	constructor(debug = false) {
		this.debug = debug;
		this.builder = new QueryBuilder(debug);
	}

	/**
	 * Adds a SELECT statement to the query
	 *
	 * @param  {string} 	table 			Name of the table you want to select something from
	 * @param  {string[]}  	[keys=[]]  		The items you want tot select
	 * @param  {string[]} 	[names=[]] 		Key name of the value
	 *
	 * @return {object} - Current instance of the Query
	 */
	select(table: string, keys: string[] = [], names: string[] = []) {
		let tmpKeys: IKey[] = [];

		keys.forEach((key, i) => {
			tmpKeys.push({ key: reference(table, key), as: names.length > 0 ? names[i] : null });
		});

		this.builder = this.builder.select(table, tmpKeys, names);
		return this;
	}

	/**
	 * Adds a row into the database
	 *
	 * @param  {string}		table 				Name of the table you want to select something from
	 * @param  {string[]}  	[keys=[]]  			The keys for the items you want to insert
	 * @param  {string[]} 	[values=[]] 		The actual values you want to insert
	 *
	 * @return {object} - Current instance of the Query
	 */
	insert(table: string, keys: string[], values: string[] = []) {
		let tmpKeys: IKey[] = [];

		keys.forEach((key) => {
			tmpKeys.push({ key: reference(table, key) });
		});

		this.builder = this.builder.insert(table, tmpKeys, values);
		return this;
	}

	/**
	 * Update a row in the database
	 *
	 * @param  {string} 	table				Name of the table you want to select something from
	 * @param  {string[]}  	[keys=[]] 			The keys for the items you want to update
	 * @param  {string[]} 	[values=[]] 		The actual values you want to update
	 *
	 * @return {object} - Current instance of the Query
	 */
	update(table: string, keys: string[], values: string[] = []) {
		let tmpKeys: IKey[] = [];

		keys.forEach((key) => {
			tmpKeys.push({ key: reference(table, key) });
		});

		this.builder = this.builder.update(table, tmpKeys, values);
		return this;
	}

	/**
	 * Removes a row from the selected table
	 *
	 * @param  {string}     table   - Name of the table you want to select something from
	 *
	 * @return {object} - Current instance of the Query
	 */
	delete(table: string) {
		this.builder = this.builder.delete(table);
		return this;
	}

	/**
	 * Truncates the given table
	 *
	 * @param  {string}     table   - Name of the table you want to select something from
	 *
	 * @return {object} - Current instance of the Query
	 */
	truncate(table: string) {
		this.builder = this.builder.truncate(table);
		return this;
	}

	/**
	 * Adds a COUNT() selector to the select statement
	 *
	 * @param  {string} 	table 				Name of the table you want to select something from
	 * @param  {string}  	key  				The key you want to count
	 * @param  {string} 	[keyName="count"] 	The name of the count result
	 *
	 * @return {object} - Current instance of the Query
	 */
	count(table: string, key: string, keyName = 'count') {
		this.builder = this.builder.selectFunc(
			table,
			{ key: reference(table, key), func: SelectFunction.COUNT, as: keyName },
			keyName,
			SelectFunction.COUNT
		);
		return this;
	}

	/**
	 * Adds a AVG() selector to the select statement
	 *
	 * @param  {string} 	table 				Name of the table you want to select something from
	 * @param  {string}  	key  				The key you want to count
	 * @param  {string} 	[keyName="avg"] 	The name of the count result
	 *
	 * @return {object} - Current instance of the Query
	 */
	avg(table: string, key: string, keyName = 'avg') {
		this.builder = this.builder.selectFunc(
			table,
			{ key: reference(table, key), func: SelectFunction.AVG, as: keyName },
			keyName,
			SelectFunction.AVG
		);
		return this;
	}

	/**
	 * Adds a sum() selector to the select statement
	 * Note: this function is not yet automaticly escaped, and doesn't work with joins currently
	 *
	 * @param  {string} 	table 				Name of the table you want to select something from
	 * @param  {string}  	sum  				The expression to sum
	 * @param  {string} 	[keyName="sum"] 	The name of the count result
	 *
	 * @return {object} - Current instance of the Query
	 */
	sum(table: string, sum: string, keyName = 'sum') {
		this.builder = this.builder.selectFunc(
			table,
			{ key: reference(table, sum), func: SelectFunction.SUM, as: keyName },
			keyName,
			SelectFunction.SUM
		);
		return this;
	}

	/**
	 * Adds a fulltext statement to the SQL query
	 *
	 * @param  {string} 			index      			The fulltext index you want to check, example: 'title,body'
	 * @param  {string} 			value    			The keywords to search for
	 * @param  {FulltextMode} 	    mode		    	The fulltext mode (NATURAL LANGUAGE or BOOLEAN)
	 * @param  {string}				[keyName=score]		Name of the key
	 *
	 * @return {object} - Current instance of the Query
	 */
	fulltext(index: string, value: string, mode: FulltextMode, keyName = 'score') {
		// @todo: this should use the selectFunc with SelectionFunction.Fulltext
		// this.builder = this.builder.fulltext(index, value, mode, keyName);
		return this;
	}

	/**
	 * Adds a where clause to the SQL statement
	 *
	 * @param  {Reference} 	key      		    The key you want to check
	 * @param  {string} 	value    		    The value you want to check against
	 * @param  {string} 	[operator="="]		Comparison operator
	 *
	 * @return {object} - Current instance of the Query
	 */
	where(key: string | Reference, value: string, operator = '=') {
		this.builder = this.builder.where(this.convertKeyToReference(key), value, operator, WhereType.DEFAULT);
		return this;
	}

	/**
	 * Adds a OR clause to the where clause to the SQL statement
	 * Note: Can only be uses after the where() function
	 *
	 * @param  {Reference} 	key      		    The key you want to check
	 * @param  {string} 	value    		    The value you want to check against
	 * @param  {string} 	[operator="="]		Comparison operator
	 *
	 * @return {object} - Current instance of the Query
	 */
	orWhere(key: string | Reference, value: string, operator = '=') {
		this.builder = this.builder.where(this.convertKeyToReference(key), value, operator, WhereType.OR);
		return this;
	}

	/**
	 * Adds a AND clause to the where clause to the SQL statement
	 * Note: Can only be uses after the where() function
	 *
	 * @param  {Reference} 	key      		    The key you want to check
	 * @param  {string} 	value    		    The value you want to check against
	 * @param  {string} 	[operator="="]		Comparison operator
	 *
	 * @return {object} - Current instance of the Query
	 */
	andWhere(key: string | Reference, value: string, operator = '=') {
		this.builder = this.builder.where(this.convertKeyToReference(key), value, operator, WhereType.AND);
		return this;
	}

	/**
	 * Adds a fulltext where statement to the SQL query
	 *
	 * @param  {string} 			key      		The key you want to check, example: 'title,body'
	 * @param  {string} 			value    		The keywords to search for
	 * @param  {FulltextMode} 	mode		    The fulltext mode (NATURAL LANGUAGE or BOOLEAN)
	 *
	 * @return {object} - Current instance of the Query
	 */
	whereFulltext(key: string | Reference, value: string, mode: FulltextMode) {
		this.builder = this.builder.whereFulltext(this.convertKeyToReference(key), value, mode, WhereType.DEFAULT);
		return this;
	}

	/**
	 * Adds a fulltext where statement to the SQL query
	 *
	 * @param  {string} 			key      		The key you want to check, example: 'title,body'
	 * @param  {string} 			value    		The keywords to search for
	 * @param  {FulltextMode} 	mode		    The fulltext mode (NATURAL LANGUAGE or BOOLEAN)
	 *
	 * @return {object} - Current instance of the Query
	 */
	orWhereFulltext(key: string | Reference, value: string, mode: FulltextMode) {
		this.builder = this.builder.whereFulltext(this.convertKeyToReference(key), value, mode, WhereType.OR);
		return this;
	}

	/**
	 * Adds a fulltext where statement to the SQL query
	 *
	 * @param  {string} 			key      		The key you want to check, example: 'title,body'
	 * @param  {string} 			value    		The keywords to search for
	 * @param  {FULLTEXT_MODE} 	    mode		    The fulltext mode (NATURAL LANGUAGE or BOOLEAN)
	 *
	 * @return {object} - Current instance of the Query
	 */
	andWhereFulltext(key: string | Reference, value: string, mode: FulltextMode) {
		this.builder = this.builder.whereFulltext(this.convertKeyToReference(key), value, mode, WhereType.AND);
		return this;
	}

	/**
	 * Adds a between where clause to the SQL statement
	 *
	 * @param  {string} 	key      		The key you want to check
	 * @param  {int} 	    min    		    The minium value for the given key
	 * @param  {int} 	    max		        The maximum value for the given key
	 *
	 * @return {object} - Current instance of the Query
	 */
	whereBetween(key: string | Reference, min: number, max: number) {
		this.builder = this.builder.whereBetween(this.convertKeyToReference(key), min, max, WhereType.DEFAULT);
		return this;
	}

	/**
	 * Adds a OR between where clause to the SQL statement
	 *
	 * @param  {string} 	key      		The key you want to check
	 * @param  {int} 	    min    		    The minium value for the given key
	 * @param  {int} 	    max		        The maximum value for the given key
	 *
	 * @return {object} - Current instance of the Query
	 */
	orWhereBetween(key: string | Reference, min: number, max: number) {
		this.builder = this.builder.whereBetween(this.convertKeyToReference(key), min, max, WhereType.OR);
		return this;
	}

	/**
	 * Adds a AND between where clause to the SQL statement
	 *
	 * @param  {string} 	key      		The key you want to check
	 * @param  {int} 	    min    		    The minium value for the given key
	 * @param  {int} 	    max		        The maximum value for the given key
	 *
	 * @return {object} - Current instance of the Query
	 */
	andWhereBetween(key: string | Reference, min: number, max: number) {
		this.builder = this.builder.whereBetween(this.convertKeyToReference(key), min, max, WhereType.AND);
		return this;
	}

	/**
	 * Adds a left join to the SQL query
	 *
	 * @param  {string} 	table    			The table you want to join
	 * @param  {string} 	key      			The key to compare
	 * @param  {string} 	value    			The value to compare the key to
	 *
	 * @return {object} - Current instance of the Query
	 */
	leftJoin(table: string, key: string, value: string) {
		this.builder = this.builder.join(new Reference(table, key), this.convertKeyToReference(value), JoinType.Inner);
		return this;
	}

	/**
	 * Adds a right join to the SQL query
	 *
	 * @param  {string} 	table    			The table you want to join
	 * @param  {string} 	key      			The key to compare
	 * @param  {string} 	value    			The value to compare the key to
	 *
	 * @return {object} - Current instance of the Query
	 */
	rightJoin(table: string, key: string, value: string) {
		this.builder = this.builder.join(new Reference(table, key), this.convertKeyToReference(value), JoinType.Inner);
		return this;
	}

	/**
	 * Adds a inner join to the SQL query
	 *
	 * @param  {string} 	table    			The table you want to join
	 * @param  {string} 	key      			The key to compare
	 * @param  {string} 	value    			The value to compare the key to
	 *
	 * @return {object} - Current instance of the Query
	 */
	innerJoin(table: string, key: string, value: string | Reference) {
		this.builder = this.builder.join(new Reference(table, key), this.convertKeyToReference(value), JoinType.Inner);
		return this;
	}

	/**
	 * Limits the amount of data the database should return
	 *
	 * @param {int} [offset=0] - Start returning from this point
	 * @param {int} [amount=25] - The amount of items that should be returned
	 *
	 * @return {object} - Current instance of the Query
	 */
	limit(offset: number = 0, amount: number = 25) {
		this.builder = this.builder.limit(offset, amount);
		return this;
	}

	/**
	 * Orders the results by the given key
	 *
	 * @param  {string} 	key 					- The key to order by
	 * @param  {sortOrder}  [sortOrder = 'ASC'] 	- The order to sort in 'ASC' or 'DESC'
	 *
	 * @return {object} - Current instance of the Query
	 */
	orderBy(key: string | Reference, sortOrder: SortOrder = SortOrder.ASC) {
		this.builder = this.builder.order(this.convertKeyToReference(key), sortOrder);
		return this;
	}

	/**
	 * Adds a subquery to the SQL query
	 *
	 * @param  {QueryBuilder} 	queryBuilder 			New instance of the QueryBuilder to
	 * @param  {string}			[keyName="result"]		Name of the results of the sub query
	 *
	 * @return {object} - Current instance of the Query
	 */
	subQuery(queryBuilder: QueryBuilder, keyName = 'result') {
		this.builder = this.builder.subQuery(queryBuilder, keyName);
		return this;
	}

	/**
	 * Adds the given SQL query to the QueryBuilder
	 * Note: requires the database connection to be setup via the DatabaseConnection.connect() function
	 *
	 * @param  {string}			sql 		- SQL Query
	 *
	 * @return {object} - Current instance of the Query
	 */
	raw(sql: string) {
		return new Promise(function(resolve, reject) {
			this.databaseConnection.get().query(sql, (err: any, data: any) => {
				if (err === null) {
					resolve(data);
				} else {
					reject(err);
				}
			});
		});
	}

	/**
	 * Prepares the Query for execution
	 *
	 * @return {object} - Current instance of the Query
	 */
	prepare() {
		let _builder = this.builder.prepare();

		if (_builder instanceof QueryBuilder) {
			this.builder = _builder;
		} else {
			throw new Error('Failed to prepare query');
		}

		return this;
	}

	/**
	 * Executes the SQL Query
	 *
	 * @returns {Promise} - Promise containing the results
	 */
	execute() {
		if (this.databaseConnection === null) {
			throw new Error('You need to make a database connection first!');
		}

		return new Promise(function(resolve, reject) {
			this.databaseConnection.get().query(this.builder.builder._query, (err: any, data: any) => {
				if (err === null) {
					resolve(data);
				} else {
					reject(err);
				}
			});
		});
	}

	/**
	 * Shortcut for prepare().execute()
	 *
	 * @returns {Promise} - Promise containing the results
	 */
	go() {
		return this.prepare().execute();
	}

	private convertKeyToReference(key: string | Reference) {
		let ref: Reference;

		if (key instanceof Reference) {
			ref = key;
		} else {
			ref = new Reference(this.builder.get().builder.table, key);
		}

		return ref;
	}
}

export default Query;
