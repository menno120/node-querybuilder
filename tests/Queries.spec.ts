import "mocha";
import { expect } from "chai";
import QueryBuilder from "../src/classes/QueryBuilder";

describe("QueryBuilder", () => {
	let querybuilder: QueryBuilder = new QueryBuilder();

	beforeEach(function() {
		querybuilder = new QueryBuilder();
	});

	describe("Select statement", () => {
		it("should return a valid SQL statement", () => {
			querybuilder.select("tablename", ["id"], []).prepare();
			expect(querybuilder.get().query).to.equal("SELECT id FROM tablename");
		});
	});
});
