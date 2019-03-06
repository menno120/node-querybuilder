import Reference from './Reference';
import { WhereType, ComparisonFunctions, ComparisonOperators } from '../../helpers';
import IWhere from '../../interfaces/IWhere';

class Where implements IWhere {
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
