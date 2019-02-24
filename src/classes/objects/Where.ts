import Reference from "./Reference";
import { WhereType, ComparisonFunctions, ComparisonOperators } from "../../helpers";

class Where {
	readonly key: Reference;
	readonly value: string;
	readonly operator: string | ComparisonFunctions | ComparisonOperators;
	readonly type: WhereType;

	constructor(
		key: Reference,
		value: string,
		operator: string | ComparisonFunctions | ComparisonOperators,
		type: WhereType
	) {
		this.key = key;
		this.value = value;
		this.operator = operator;
		this.type = type;
	}
}

export default Where;
