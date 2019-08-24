import 'mocha';
import { expect } from 'chai';
import QueryBuilder from '../src/classes/QueryBuilder';
import Query from '../src/classes/Query';
import Reference from '../src/models/Reference';

describe('Sample queries', () => {
	let query: Query = new Query();

	beforeEach(function() {
		query = new Query();
	});

	describe('Basic SELECT statement', () => {
		it('should return a valid SQL statement', () => {
			query.select('tablename', [new Reference('tablename', 'table')], []).prepare();
			expect(query.getRawQuery).to.equal('SELECT `tablename`.`table` FROM tablename');
		});
	});

	describe('Basic UPDATE statement', () => {
		it('should return a valid SQL statement', () => {
			query.select('tablename', [new Reference('tablename', 'table')], []).prepare();
			expect(query.getRawQuery).to.equal('SELECT `tablename`.`table` FROM tablename');
		});
	});

	describe('Basic DELETE statement', () => {
		it('should return a valid SQL statement', () => {
			query
				.delete('tablename')
				.where(new Reference('tablename', 'table'), 'test')
				.prepare();
			expect(query.getRawQuery).to.equal(
				"DELETE `tablename`.`table` FROM tablename WHERE tablename.table = 'test'"
			);
		});
	});
});
