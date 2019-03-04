import 'mocha';
import { expect } from 'chai';
import { uuid, reference } from '../src/helpers';
import Reference from '../src/classes/objects/Reference';

describe('Helpers', () => {
	describe('uuid', () => {
		it('should return a valid uuid', () => {
			const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/i;
			const test = uuidRegex.test(uuid());
			expect(test).to.equal(true);
		});
	});

	describe('reference', () => {
		it('should return a reference object', () => {
			expect(reference('table', 'key')).to.be.instanceOf(Reference);
		});
	});
});
