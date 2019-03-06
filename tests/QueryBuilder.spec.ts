import 'mocha';
import { expect } from 'chai';
import QueryBuilder, { QueryType } from '../src/classes/QueryBuilder';

describe('QueryBuilder', () => {
	let queryBuilder: QueryBuilder = new QueryBuilder();

	beforeEach(function() {
		queryBuilder = new QueryBuilder();
	});

	describe('constructor', () => {
		it('should return a valid QueryBuilder object', () => {
			expect(queryBuilder).to.be.instanceOf(QueryBuilder);
		});

		it("shouldn't be in debug mode", () => {
			expect(queryBuilder.get.debugging).to.equal(false);
		});
	});

	describe('constructor', () => {
		let _queryBuilder = new QueryBuilder(true);

		it('should return a valid QueryBuilder object', () => {
			expect(_queryBuilder).to.be.instanceOf(QueryBuilder);
		});

		it('should be in debug mode', () => {
			expect(_queryBuilder.get.debugging).to.equal(true);
		});
	});

	describe('select', () => {
		it('type should be select', () => {
			queryBuilder = queryBuilder.select('tablename', [{ key: { table: 'tablename', key: 'id' } }], []);

			expect(queryBuilder.get.builder.type).to.equal(QueryType.select);
			expect(queryBuilder.get.builder.table).to.equal('tablename');
		});
	});

	describe('insert', () => {
		it('type should be insert', () => {
			queryBuilder = queryBuilder.insert('tablename', [{ key: { table: 'tablename', key: 'id' } }], []);

			expect(queryBuilder.get.builder.type).to.equal(QueryType.insert);
			expect(queryBuilder.get.builder.table).to.equal('tablename');
		});
	});

	describe('update', () => {
		it('type should be update', () => {
			queryBuilder = queryBuilder.update('tablename', [{ key: { table: 'tablename', key: 'id' } }], []);

			expect(queryBuilder.get.builder.type).to.equal(QueryType.update);
			expect(queryBuilder.get.builder.table).to.equal('tablename');
		});
	});

	describe('delete', () => {
		it('type should be delete', () => {
			queryBuilder = queryBuilder.delete('tablename');

			expect(queryBuilder.get.builder.type).to.equal(QueryType.delete);
			expect(queryBuilder.get.builder.table).to.equal('tablename');
		});
	});

	describe('truncate', () => {
		it('type should be truncate', () => {
			queryBuilder = queryBuilder.truncate('tablename');

			expect(queryBuilder.get.builder.type).to.equal(QueryType.truncate);
			expect(queryBuilder.get.builder.table).to.equal('tablename');
		});
	});
});
