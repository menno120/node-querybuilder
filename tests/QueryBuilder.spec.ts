import "mocha";
import { expect } from "chai";
import QueryBuilder, { QueryType } from "../src/classes/QueryBuilder";

describe("QueryBuilder", () => {
	let querybuilder: QueryBuilder = new QueryBuilder();

	beforeEach(function() {
		querybuilder = new QueryBuilder();
	});

	describe("constructor", () => {
		it("should return a valid QueryBuilder object", () => {
			expect(querybuilder).to.be.instanceOf(QueryBuilder);
		});

		it("should be in debug mode", () => {
			expect(new QueryBuilder(true).get().debugging).to.equal(true);
		});

		it("shouldn't be in debug mode", () => {
			expect(new QueryBuilder(false).get().debugging).to.equal(false);
		});
	});

	describe("select", () => {
		it("type should be select", () => {
			let query = new QueryBuilder().select("tablename", ["id"], []);
			expect(query.get().builder.type).to.equal(QueryType.select);
		});
	});

	describe("insert", () => {
		it("type should be insert", () => {
			let query = new QueryBuilder().insert("tablename", ["id"], []);
			expect(query.get().builder.type).to.equal(QueryType.insert);
		});
	});

	describe("update", () => {
		it("type should be update", () => {
			let query = new QueryBuilder().update("tablename", ["id"], []);
			expect(query.get().builder.type).to.equal(QueryType.update);
		});
	});

	describe("delete", () => {
		it("type should be delete", () => {
			let query = new QueryBuilder().delete("tablename");
			expect(query.get().builder.type).to.equal(QueryType.delete);
		});
	});

	describe("truncate", () => {
		it("type should be truncate", () => {
			let query = new QueryBuilder().truncate("tablename");
			expect(query.get().builder.type).to.equal(QueryType.truncate);
		});
	});
});
