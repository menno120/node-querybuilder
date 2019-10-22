import 'mocha';
import { expect, assert } from 'chai';

import Query from '../src/classes/Query';
import Reference from '../src/models/Reference';

describe('QueryBuilder prepare', () => {
	describe('Sample queries', () => {
		let query: Query = new Query();

		beforeEach(function() {
			query = new Query();
		});

		describe('simple SELECT statement', () => {
			it('should return a valid SQL statement', () => {
				query.select('tablename', [new Reference('tablename', 'table')], []).prepare();

				assert.isString(query.getRawQuery(), 'query should be of type string');
				expect(query.getRawQuery()).to.deep.equal('SELECT `tablename`.`table` FROM tablename');
			});
		});

		describe('simple UPDATE statement', () => {
			it('should return a valid SQL statement', () => {
				query.select('tablename', [new Reference('tablename', 'table')], []).prepare();

				assert.isString(query.getRawQuery(), 'query should be of type string');
				expect(query.getRawQuery()).to.deep.equal('SELECT `tablename`.`table` FROM tablename');
			});
		});

		describe('simple DELETE statement', () => {
			it('should return a valid SQL statement', () => {
				query
					.delete('tablename')
					.where(new Reference('tablename', 'table'), 'test')
					.prepare();

				assert.isString(query.getRawQuery(), 'query should be of type string');
				expect(query.getRawQuery()).to.deep.equal("DELETE FROM tablename WHERE `tablename`.`table` = 'test'");
			});
		});

		describe('limit statement', () => {
			it('should return a valid SQL statement', () => {
				query
					.select('tablename', [new Reference('tablename', 'table')], [])
					.limit(0, 20)
					.prepare();

				assert.isString(query.getRawQuery(), 'query should be of type string');
				expect(query.getRawQuery()).to.deep.equal('SELECT `tablename`.`table` FROM tablename LIMIT 0,20');
			});
		});

		describe('join statement', () => {
			it('should return a valid SQL statement', () => {
				query
					.select('tablename', [new Reference('tablename', 'table')], [])
					.where(new Reference('tablename', 'table'), 'wherevalue')
					.leftJoin('jointable', 'joinname', 'joinvalue')
					.prepare();

				assert.isString(query.getRawQuery(), 'query should be of type string');
				expect(query.getRawQuery()).to.deep.equal(
					"SELECT `tablename`.`table` FROM tablename LEFT JOIN `jointable`.`joinname` = 'joinvalue' WHERE `tablename`.`table` = 'wherevalue'"
				);
			});
		});

		describe('complicated where statement', () => {
			it('should return a valid SQL statement', () => {
				query
					.select('tablename', [new Reference('tablename', 'table')], [])
					.where(new Reference('tablename', 'table'), 'test')
					.orWhere(new Reference('tablename', 'table'), 'test')
					.andWhere(new Reference('tablename', 'table'), 'test')
					.orWhere(new Reference('tablename', 'table'), 'test')
					.prepare();

				assert.isString(query.getRawQuery(), 'query should be of type string');
				expect(query.getRawQuery()).to.deep.equal(
					"SELECT `tablename`.`table` FROM tablename WHERE `tablename`.`table` = 'test' OR `tablename`.`table` = 'test' AND `tablename`.`table` = 'test' OR `tablename`.`table` = 'test'"
				);
			});
		});

		describe('complicated join statement', () => {
			it('should return a valid SQL statement', () => {
				query
					.select('tablename', [new Reference('tablename', 'table')], [])
					.where(new Reference('tablename', 'table'), 'test')
					.leftJoin('table', 'test', 'value')
					.innerJoin('table', 'test', 'value')
					.rightJoin('table', 'test', 'value')
					.prepare();

				assert.isString(query.getRawQuery(), 'query should be of type string');
				expect(query.getRawQuery()).to.deep.equal(
					"SELECT `tablename`.`table` FROM tablename LEFT JOIN `table`.`test` = value INNER JOIN `table`.`test` = value RIGHT JOIN `table`.`test` = value WHERE `tablename`.`table` = 'test'"
				);
			});
		});
	});
});
