import 'mocha';
import { expect } from "chai";
import { uuid } from "../src/helpers";

describe("Helpers", () => {
	describe("uuidv4", () => {
		it("should return a valid uuid", () => {
			const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/i;
			const test = uuidRegex.test(uuid());
			expect(test).to.equal(true);
		});
	});
});
