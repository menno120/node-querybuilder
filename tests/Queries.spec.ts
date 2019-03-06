import 'mocha';
import { expect } from 'chai';
import QueryBuilder from '../src/classes/QueryBuilder';
import Reference from '../src/classes/objects/Reference';

describe('QueryBuilder', () => {
	let querybuilder: QueryBuilder = new QueryBuilder();

	beforeEach(function() {
		querybuilder = new QueryBuilder();
	});

	describe('Select statement', () => {
		it('should return a valid SQL statement', () => {
			querybuilder.select('tablename', [{ key: new Reference('tablename', 'table') }], []).prepare();
			expect(querybuilder.get.query).to.equal('SELECT `tablename`.`table` FROM tablename');
		});
	});
});
