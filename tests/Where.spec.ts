import 'mocha';
import { expect } from 'chai';
import Where from '../src/models/Where';
import Reference from '../src/models/Reference';
import IWhere from '../src/interfaces/IWhere';
import { ComparisonOperators, WhereType } from '../src/helpers';

describe('Where', () => {
	describe('constructor', () => {
		it('should return a valid IWhere object', () => {
			let where: IWhere = new Where(
				new Reference('tablename', 'key'),
				'value',
				ComparisonOperators.Equals,
				WhereType.DEFAULT
			);

			expect(where.key).to.be.instanceof(Where);
			// expect(where.key).to.equal({ table: 'tablename', key: 'key' });
			expect(where.value).to.equal('value');
			expect(where.operator).to.equal(ComparisonOperators.Equals);
			expect(where.type).to.equal(WhereType.DEFAULT);
		});
	});
});
