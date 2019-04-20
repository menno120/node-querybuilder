import 'mocha';
import { expect, config } from 'chai';
import Query from '../src/classes/Query';
import { QueryType, SelectFunction } from '../src/classes/QueryBuilder';
import Reference from '../src/models/Reference';
import Key from '../src/models/Key';
import { FulltextMode, reference } from '../src/helpers';

describe('Query', () => {
	config.showDiff = true;
	config.truncateThreshold = 0;

	describe('constructor', () => {
		it('should set the debug mode', () => {
			const value = true;

			let query = new Query();

			expect(query.debug).to.deep.equal(value);
			expect(query.builder.get.debugging).to.deep.equal(value);
		});
	});

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

		it('should throw an error with unequal amounts of keys(2) and names(1)', () => {
			expect(() => new Query().select('table', ['id', 'name'], ['name'])).to.throw(
				'Names array should be equal length as the keys array!'
			);
		});
	});

	describe('insert', () => {
		it('should be of type insert', () => {
			let query = new Query().insert('table', ['id', 'name'], ['id', 'name']);

			expect(query.builder.get.builder.type).to.equal(QueryType.insert);
		});

		it('should set the tablename', () => {
			let query = new Query().insert('table', ['id', 'name'], ['1', 'John Doe']);

			expect(query.builder.get.builder.table).to.equal('table');
		});

		it('should set the keys array', () => {
			let query = new Query().insert('table', ['id', 'name'], ['1', 'John Doe']);

			expect(query.builder.get.builder.keys).to.deep.equal([
				new Key(new Reference('table', 'id')),
				new Key(new Reference('table', 'name'))
			]);
		});

		it('should set the values array', () => {
			let query = new Query().insert('table', ['id', 'name'], ['1', 'John Doe']);

			expect(query.builder.get.builder.values).to.deep.equal(['1', 'John Doe']);
		});

		it('should set the values array', () => {
			let query = new Query().insert('table', ['id', 'name'], ['1', 'John Doe']);

			expect(query.builder.get.builder.values).to.deep.equal(['1', 'John Doe']);
		});

		it('should throw an error with unequal amounts of keys(2) and values(0)', () => {
			expect(() => new Query().insert('table', ['id', 'name'], [])).to.throw(
				'Expected equal amount of keys and values'
			);
		});

		it('should throw an error with unequal amounts of keys(2) and values(1)', () => {
			expect(() => new Query().insert('table', ['id', 'name'], ['1'])).to.throw(
				'Expected equal amount of keys and values'
			);
		});

		it('should throw an error with unequal amounts of keys(2) and values(3)', () => {
			expect(() => new Query().insert('table', ['id', 'name'], ['1', 'test', 'unused'])).to.throw(
				'Expected equal amount of keys and values'
			);
		});
	});

	describe('update', () => {
		it('should be of type update', () => {
			let query = new Query().update('table', ['id', 'name'], ['id', 'name']);

			expect(query.builder.get.builder.type).to.equal(QueryType.update);
		});

		it('should set the table', () => {
			let query = new Query().update('table', ['id', 'name'], ['id', 'name']);

			expect(query.builder.get.builder.table).to.equal('table');
		});
	});

	describe('delete', () => {
		it('should be of type delete', () => {
			let query = new Query().delete('table');

			expect(query.builder.get.builder.type).to.equal(QueryType.delete);
		});

		it('should set the table', () => {
			let query = new Query().delete('table');

			expect(query.builder.get.builder.table).to.equal('table');
		});
	});

	describe('truncate', () => {
		it('should be of type truncate', () => {
			let query = new Query().truncate('table');

			expect(query.builder.get.builder.type).to.equal(QueryType.truncate);
		});

		it('should set the table', () => {
			let query = new Query().truncate('table');

			expect(query.builder.get.builder.table).to.equal('table');
		});
	});

	describe('count', () => {
		it('should be of type select', () => {
			let query = new Query().count('table', 'id', 'count_value');

			expect(query.builder.get.builder.type).to.equal(QueryType.select);
		});

		it('should set the parameters', () => {
			let query = new Query().count('table', 'id', 'count_value');

			expect(query.builder.get.builder.keys).to.deep.equal([
				{
					key: reference('table', 'id'),
					func: SelectFunction.COUNT,
					as: 'count_value'
				}
			]);
		});

		it('should set a default keyName', () => {
			let query = new Query().count('table', 'id');

			expect(query.builder.get.builder.keys[0].as).to.equal('count');
		});
	});

	describe('avg', () => {
		it('should be of type select', () => {
			let query = new Query().avg('table', 'id', 'avg_value');

			expect(query.builder.get.builder.type).to.equal(QueryType.select);
		});

		it('should set the parameters', () => {
			let query = new Query().avg('table', 'id', 'avg_value');

			expect(query.builder.get.builder.keys).to.deep.equal([
				{
					key: reference('table', 'id'),
					func: SelectFunction.AVG,
					as: 'avg_value'
				}
			]);
		});

		it('should set a default keyName', () => {
			let query = new Query().avg('table', 'id');

			expect(query.builder.get.builder.keys[0].as).to.equal('avg');
		});
	});

	describe('sum', () => {
		it('should be of type select', () => {
			let query = new Query().sum('table', 'id', 'sum_value');

			expect(query.builder.get.builder.type).to.equal(QueryType.select);
		});

		it('should set the parameters', () => {
			let query = new Query().sum('table', 'id', 'sum_value');

			expect(query.builder.get.builder.keys).to.deep.equal([
				{
					key: reference('table', 'id'),
					func: SelectFunction.SUM,
					as: 'sum_value'
				}
			]);
		});

		it('should set a default keyName', () => {
			let query = new Query().sum('table', 'id');

			expect(query.builder.get.builder.keys[0].as).to.equal('sum');
		});
	});

	describe('fulltext', () => {
		it('should be of type select', () => {
			let query = new Query().fulltext('title,body', 'lorem ipsum', FulltextMode.BooleanMode);

			expect(query.builder.get.builder.type).to.equal(QueryType.select);
		});

		it('should set the parameters', () => {
			let query = new Query().fulltext('title,body', 'lorem ipsum', FulltextMode.BooleanMode);

			expect(query.builder.get.builder.keys).to.deep.equal([
				{
					key: reference('', 'title,body'),
					func: SelectFunction.FULLTEXT,
					as: 'score'
				}
			]);
		});

		it('should set a default keyName', () => {
			let query = new Query().fulltext('title,body', 'lorem ipsum', FulltextMode.BooleanMode);

			expect(query.builder.get.builder.keys[0].as).to.deep.equal('score');
		});
	});

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

	describe('transaction', () => {
		it('should set transaction', () => {
			const value = true;

			let query = new Query().transaction([]);

			expect(query._transaction).to.equal(value);
		});

		it('should fill the queries array', () => {
			const values = [
				new Query().select('tablename', ['keyname']),
				new Query().select('tablename', ['keyname']),
				new Query().select('tablename', ['keyname'])
			];

			let query = new Query().transaction(values);

			expect(query._transactionQueries).to.deep.equal(values);
		});
	});

	// Private functions
	describe('convertKeyToReference', () => {});
});
