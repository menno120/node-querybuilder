import 'mocha';
import { expect } from 'chai';
import Join from '../src/models/Join';
import IJoin from '../src/interfaces/IJoin';
import Reference from '../src/models/Reference';
import { JoinType } from '../src/helpers';

describe('Join', () => {
	describe('constructor', () => {
		it('should return a valid Join object', () => {
			let where: IJoin = new Join(
				new Reference('tablename1', 'id'),
				new Reference('tablename2', 'id'),
				JoinType.Inner
			);

			expect(where.table).to.be.instanceof(Reference);
			expect(where.join).to.be.instanceOf(Reference);
			expect(where.pos).to.equal(JoinType.Inner);
			expect(where.operator).to.equal('=');
		});
	});
});