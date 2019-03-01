import "mocha";
import { expect } from "chai";
import Key from "../src/classes/objects/Key";
import Reference from "../src/classes/objects/Reference";
import { SelectFunction } from "../src/classes/QueryBuilder";

describe("Key", () => {
	describe("constructor", () => {
		let key = new Key(new Reference("tablename", "id"), "outputValue");

		expect(key.key).to.equal({ table: "tablename", key: "id" });
		expect(key.as).to.equal("outputValue");
		expect(key.func).to.equal(null);
	});

	describe("constructor", () => {
		let key = new Key(new Reference("tablename", "id"), null, SelectFunction.AVG);

		expect(key.key).to.equal({ table: "tablename", key: "id" });
		expect(key.as).to.equal(null);
		expect(key.func).to.equal(SelectFunction.AVG);
	});

	describe("constructor", () => {
		let key = new Key(new Reference("tablename", "id"), "outputValue", SelectFunction.FULLTEXT);

		expect(key.key).to.equal({ table: "tablename", key: "id" });
		expect(key.as).to.equal("outputValue");
		expect(key.func).to.equal(SelectFunction.FULLTEXT);
	});
});
