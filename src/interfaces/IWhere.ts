import IReference from "./IReference";
import { ComparisonOperators, ComparisonFunctions, WhereType } from "../helpers";

interface IWhere {
	key: IReference;
	value: string;
	operator: string | ComparisonOperators | ComparisonFunctions;
	type: WhereType;
}

export default IWhere;
