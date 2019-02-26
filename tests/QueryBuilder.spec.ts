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
			querybuilder.select("tablename", ["id"], []);

			expect(querybuilder.get().builder.type).to.equal(QueryType.select);
			expect(querybuilder.get().builder.table).to.equal("tablename");
		});
	});

	describe("insert", () => {
		it("type should be insert", () => {
			querybuilder.insert("tablename", ["id"], []);

			expect(querybuilder.get().builder.type).to.equal(QueryType.insert);
			expect(querybuilder.get().builder.table).to.equal("tablename");
		});
	});

	describe("update", () => {
		it("type should be update", () => {
			querybuilder.update("tablename", ["id"], []);

			expect(querybuilder.get().builder.type).to.equal(QueryType.update);
			expect(querybuilder.get().builder.table).to.equal("tablename");
		});
	});

	describe("delete", () => {
		it("type should be delete", () => {
			querybuilder.delete("tablename");

			expect(querybuilder.get().builder.type).to.equal(QueryType.delete);
			expect(querybuilder.get().builder.table).to.equal("tablename");
		});
	});

	describe("truncate", () => {
		it("type should be truncate", () => {
			querybuilder.truncate("tablename");

			expect(querybuilder.get().builder.type).to.equal(QueryType.truncate);
			expect(querybuilder.get().builder.table).to.equal("tablename");
		});
	});
});
