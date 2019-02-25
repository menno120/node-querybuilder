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
			let query = new QueryBuilder().select("tablename", ["id"], []);
			console.log(query);
			expect(query).to.equal("SELECT `tablename`.`id` FROM `tablename`");
		});
	});
});
