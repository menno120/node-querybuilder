import "mocha";
import { expect } from "chai";
import QueryBuilder from "../src/classes/QueryBuilder";

describe("QueryBuilder", () => {
	let querybuilder: QueryBuilder = new QueryBuilder();

	beforeEach(function() {
		querybuilder = new QueryBuilder();
	});
});
