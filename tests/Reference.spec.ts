import "mocha";
import { expect } from "chai";
import Reference from "../src/classes/objects/Reference";
import IReference from "../src/interfaces/IReference";

describe("Reference", () => {
	describe("constructor", () => {
		it("should return a valid IWhere object", () => {
			let where: IReference = new Reference("tablename", "key");

			expect(where.table).to.equal("tablename");
			expect(where.key).to.equal("key");
		});
	});
});
