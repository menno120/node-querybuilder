import "mocha";
import { expect } from "chai";
import Join from "../src/classes/objects/Join";
import IJoin from "../src/interfaces/IJoin";
import Reference from "../src/classes/objects/Reference";
import { JoinType } from "../src/helpers";

describe("Join", () => {
	describe("constructor", () => {
		it("should return a valid IJoin object", () => {
			let where: IJoin = new Join(
				new Reference("tablename1", "id"),
				new Reference("tablename2", "id"),
				JoinType.Inner
			);

			expect(where.table).to.equal({ table: "tablename1", key: "id" });
			expect(where.join).to.equal({ table: "tablename2", key: "id" });
			expect(where.pos).to.equal(JoinType.Inner);
			expect(where.operator).to.equal("=");
		});
	});
});
