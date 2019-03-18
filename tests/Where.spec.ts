import 'mocha';
import { expect } from 'chai';
import Where from '../src/models/Where';
import IWhere from '../src/interfaces/IWhere';
import Reference from '../src/models/Reference';
import { ComparisonOperators, WhereType } from '../src/helpers';

describe('Where', () => {
	describe('constructor', () => {
		it('should return a valid Where object', () => {
			let where: IWhere = new Where(
				new Reference('tablename', 'key'),
				'value',
				ComparisonOperators.Equals,
				WhereType.DEFAULT
			);

			expect(where.key).to.be.instanceof(Reference);
			expect(where.value).to.equal('value');
			expect(where.operator).to.equal(ComparisonOperators.Equals);
			expect(where.type).to.equal(WhereType.DEFAULT);
		});
	});
});
