import { JoinType } from "../../helpers";
import Reference from "./Reference";

class Join {
	readonly pos: JoinType;
	readonly table: Reference;
	readonly join: Reference;
	readonly operator: string = "=";

	constructor(table: Reference, join: Reference, pos: JoinType) {
		this.pos = pos;
		this.table = table;
		this.join = join;
	}
}

export default Join;
