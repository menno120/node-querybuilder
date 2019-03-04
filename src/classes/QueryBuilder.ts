import Join from './objects/Join';
import Where from './objects/Where';
import Order from './objects/Order';
import Limit from './objects/Limit';
import Reference from './objects/Reference';
import {
	JoinType,
	WhereType,
	FulltextMode,
	operators,
	ComparisonOperators,
	ComparisonFunctions,
	reference,
	SortOrder
} from '../helpers';
import IQueryBuilder from '../interfaces/IQueryBuilder';
import IReference from '../interfaces/IReference';
import { read } from 'fs';
import IKey from '../interfaces/IKey';

export enum QueryType {
	select,
	insert,
	update,
	delete,
	truncate
}
export enum SelectFunction {
	COUNT,
	AVG,
	SUM,
	FULLTEXT
}

class QueryBuilder {
	private debugging: boolean; // Debug mode
	private builder: IQueryBuilder = {
		type: null,
		table: '',
		keys: [],
		values: [],
		where: [],
		order: [],
		joins: [],
		limit: null
	};
	private query: string = null; // The actual created query, set after prepare() is called

	/* {
		type: QueryType; // Type of query (select,insert,update,delete,truncate)
		table: string; // Table name to select from
		keys: string[]; // Keys to select
		values: string[]; // Names for the keys
		where: Where[]; // Where clauses
		order: Order[]; // Order clauses
		joins: Join[]; // Join clauses
		limit: Limit; // Limit

		_query: string; // The actual created query, set after prepare() is called
	}; */

	/**
	 * QueryBuilder constructor
	 *
	 * @param {boolean} debug - Enable debug mode
	 *
	 * @constructor
	 */
	constructor(debug = false) {
		this.debugging = debug;

		// Set default values
		this.builder.table = '';
		this.builder.keys = [];
		this.builder.values = [];
		this.builder.where = [];
		this.builder.order = [];
		this.builder.joins = [];
	}

	/**
	 * Select something from the database
	 *
	 * @param  {string}     tableName       Table name to select data from
	 * @param  {string[]}   keys  		    The items you want tot select
	 * @param  {string[]} 	names 		    Key name of the value
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	select(tableName: string, keys: IKey[], values: string[]) {
		this.builder.table = tableName;
		this.builder.type = QueryType.select;
		this.builder.keys = keys;
		this.builder.values = values;

		return this;
	}

	/**
	 * Select something from the database with a function
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	selectFunc(tableName: string, key: IKey, value: string, func: SelectFunction) {
		this.builder.table = tableName;
		this.builder.type = QueryType.select;

		// @todo add keys and values

		return this;
	}

	/**
	 * Insert statement
	 *
	 * @param  {string}     tableName       Table name to select data from
	 * @param  {string[]}   keys  		    The items you want tot select
	 * @param  {string[]} 	names 		    Key name for the values
	 * @param  {string[]}   values          The values to insert
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	insert(tableName: string, keys: IKey[], values: string[]) {
		this.builder.table = tableName;
		this.builder.type = QueryType.insert;

		this.builder.keys = keys;
		this.builder.values = values;

		return this;
	}

	/**
	 * Update statement
	 *
	 * @param  {string}     tableName       Table name to select data from
	 * @param  {string[]}   keys  		    The items you want tot select
	 * @param  {string[]} 	names 		    Key name of the value
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	update(tableName: string, keys: IKey[], values: string[]) {
		this.builder.table = tableName;
		this.builder.type = QueryType.update;

		this.builder.keys = keys;
		this.builder.values = values;

		return this;
	}

	/**
	 * Delete statement
	 *
	 * @param  {string}     tableName       Table name to select data from
	 * @param  {string[]}   keys  		    The items you want tot select
	 * @param  {string[]} 	names 		    Key name of the value
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	delete(tableName: string) {
		this.builder.table = tableName;
		this.builder.type = QueryType.delete;

		return this;
	}

	/**
	 * ...
	 *
	 * @param  {string}     tableName       Table name to select data from
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	truncate(tableName: string) {
		this.builder.table = tableName;
		this.builder.type = QueryType.truncate;

		return this;
	}

	/**
	 * ...
	 *
	 * @param  {Reference}      key
	 * @param  {string}         value
	 * @param  {string}         comparisonOperator
	 * @param  {WhereType}      type
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	where(key: Reference, value: string, comparisonOperator: string, type: WhereType) {
		this.builder.where.push(new Where(key, value, comparisonOperator, type));
		return this;
	}

	/**
	 * ...
	 *
	 * @param  {Reference}      key
	 * @param  {string}         value
	 * @param  {number}         min
	 * @param  {number}         max
	 * @param  {WhereType}      type
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	whereBetween(key: Reference, min: number, max: number, type: WhereType) {
		this.builder.where.push(new Where(key, null, ComparisonFunctions.Between, type));
		return this;
	}

	/**
	 * ...
	 *
	 * @param  {Reference}      key
	 * @param  {string}         value
	 * @param  {FulltextMode}   mode
	 * @param  {WhereType}      type
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	whereFulltext(key: Reference, value: string, mode: FulltextMode, type: WhereType) {
		this.builder.where.push(new Where(key, value, ComparisonFunctions.Fulltext, type));
		return this;
	}

	/**
	 * ...
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	join(currentTable: Reference, joinTable: Reference, pos: JoinType) {
		this.builder.joins.push(new Join(currentTable, joinTable, pos));
		return this;
	}

	/**
	 * ...
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	order(reference: Reference[] | Reference, order: SortOrder) {
		this.builder.order.push(new Order(reference, order));
		return this;
	}

	/**
	 * ...
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	limit(amount: number, offset: number = null) {
		this.builder.limit = new Limit(amount, offset);
		return this;
	}

	/**
	 * ...
	 *
	 * @param {QueryBuilder}    query   The subquery
	 * @param {string}          name    Key name of the subquery
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	subQuery(query: QueryBuilder, name: string) {
		return this;
	}

	/**
	 * ...
	 *
	 * @return {object} - Current instance of the QueryBuilder
	 */
	prepare() {
		let _query = '';

		switch (this.builder.type) {
			case QueryType.select:
				_query =
					'SELECT ' +
					this.builder.keys
						.map((key) => {
							return this.referenceToString(key.key) + (key.as !== null ? ' AS ' + key.as : '');
						})
						.join(',') +
					' FROM ' +
					this.builder.table;
				break;

			case QueryType.insert:
				_query =
					'INSERT INTO ' +
					this.builder.table +
					' (' +
					this.builder.keys
						.map((key) => {
							if (key.func !== null) {
								switch (key.func) {
									case SelectFunction.AVG:
										return 'AVG(' + this.referenceToString(key.key) + ')';

									case SelectFunction.SUM:
										return 'SUM(' + this.referenceToString(key.key) + ')';

									case SelectFunction.COUNT:
										return 'COUNT(' + this.referenceToString(key.key) + ')';

									case SelectFunction.FULLTEXT:
										return 'FULLTEXT(' + this.referenceToString(key.key) + ')';
								}
							} else {
								return this.referenceToString(key.key);
							}
						})
						.join(',') +
					') VALUES (' +
					this.builder.values.join(',') +
					')';
				break;

			case QueryType.update:
				let values = [];
				for (let i = 0; i < this.builder.keys.length; i++) {
					values.push(this.referenceToString(this.builder.keys[i].key) + '=' + this.builder.values[i]);
				}
				_query = 'UPDATE ' + this.builder.table + ' SET ' + values.join(',');
				break;

			case QueryType.delete:
				_query = 'DELETE ' + this.builder.table;
				break;

			case QueryType.truncate:
				_query = 'TRUNCATE ' + this.builder.table;
				break;

			default:
				return this.error('Unknown query type');
		}

		this.query = [
			_query,
			this.createJoinStatements(),
			this.createWhereStatements(),
			this.createOrderStatements(),
			this.createLimitStatements()
		]
			.join(' ')
			.replace(/ +(?= )/g, '')
			.trim();

		return this;
	}
	execute() {}

	private createWhereStatements() {
		let _where = '';

		if (this.debugging) {
			this.debug(_where);
		}

		return _where;
	}

	private createJoinStatements() {
		let _join = '';

		if (this.debugging) {
			this.debug(_join);
		}

		return _join;
	}

	private createOrderStatements() {
		let _order = '';
		let _orders: string[] = [];

		if (this.debugging) {
			this.debug(_order);
		}

		if (this.builder.order.length > 0) {
			_order = 'ORDER BY';

			this.builder.order.forEach((order, i) => {
				if (order.keys.length !== order.order.length) {
					throw new Error('Order keys and order are not the same length!');
				}
				for (let i = 0; i < order.keys.length; i++) {
					_orders.push(this.referenceToString(order.keys[i]) + ' ' + order.order[i].toString());
				}
			});
		}

		return _order + _orders.join(',');
	}

	private createLimitStatements() {
		if (this.builder.limit === null) {
			return '';
		}

		let statement = 'LIMIT ';

		if (this.builder.limit.offset !== null) {
			statement = statement + this.builder.limit.offset + ',';
		}

		statement = statement + this.builder.limit.amount;

		return statement;
	}

	get() {
		return {
			debugging: this.debugging,
			builder: this.builder,
			query: this.query
		};
	}

	private error(error: any) {
		console.error(error);
		throw new Error();
	}
	private debug(data: any) {
		console.groupCollapsed('QueryBuilder debugger');
		console.log(data);
		console.groupEnd();
	}

	private isReference(key: any) {
		return key.constructor.name === 'Reference';
	}

	private referenceToString(ref: IReference) {
		return '`' + ref.table + '`.`' + ref.key + '`';
	}
}

export default QueryBuilder;
