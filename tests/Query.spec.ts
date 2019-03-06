import 'mocha';
import { expect, config } from 'chai';
import Query from '../src/classes/Query';
import { QueryType } from '../src/classes/QueryBuilder';
import Reference from '../src/models/Reference';
import Key from '../src/models/Key';

describe('Query', () => {
	describe('constructor', () => {
		// @todo
	});

	// AssertionError: expected
	// [ { as: 'id', func: null, key: { table: 'table', key: 'id' } }, { as: 'name', func: null, key: { table: 'table', key: 'name' } } ]
	// to equal
	// [ { as: 'id', func: null, key: { table: 'table', key: 'id' } }, { as: 'name', func: null, key: { table: 'table', key: 'name' } } ]

	config.showDiff = true;
	config.truncateThreshold = 0;

	describe('select', () => {
		it('should be of type select', () => {
			let query = new Query().select('table');

			expect(query.builder.get.builder.type).to.equal(QueryType.select);
		});

		it('should set the tablename', () => {
			let query = new Query().select('table');

			expect(query.builder.get.builder.table).to.equal('table');
		});

		it('should set the keys array', () => {
			let query = new Query().select('table', ['id', 'name']);

			expect(query.builder.get.builder.keys).to.deep.equal([
				new Key(new Reference('table', 'id')),
				new Key(new Reference('table', 'name'))
			]);
		});

		it('should set the names array', () => {
			let query = new Query().select('table', ['id', 'name'], ['id', 'name']);

			expect(query.builder.get.builder.keys).to.deep.equal([
				new Key(new Reference('table', 'id'), 'id'),
				new Key(new Reference('table', 'name'), 'name')
			]);
		});

		it('should throw an error with unequal amounts of keys and names', () => {
			expect(() => new Query().select('table', ['id', 'name'], ['name'])).to.throw(
				'Names array should be equal length as the keys array!'
			);
		});
	});

	describe('insert', () => {});
	describe('update', () => {});
	describe('delete', () => {});
	describe('truncate', () => {});
	describe('count', () => {});
	describe('avg', () => {});
	describe('sum', () => {});
	describe('fulltext', () => {});
	describe('where', () => {});
	describe('orWhere', () => {});
	describe('andWhere', () => {});
	describe('whereFulltext', () => {});
	describe('orWhereFulltext', () => {});
	describe('andWhereFulltext', () => {});
	describe('whereBetween', () => {});
	describe('orWhereBetween', () => {});
	describe('andWhereBetween', () => {});
	describe('leftJoin', () => {});
	describe('rightJoin', () => {});
	describe('innerJoin', () => {});
	describe('limit', () => {});
	describe('orderBy', () => {});
	describe('subQuery', () => {});
	describe('raw', () => {});
	describe('prepare', () => {});
	describe('execute', () => {});
	describe('go', () => {});

	// Private functions
	describe('convertKeyToReference', () => {});
});
