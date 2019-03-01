import { JoinType } from "../helpers";
import IReference from "./IReference";

interface IJoin {
	pos: JoinType;
	table: IReference;
	join: IReference;
	operator: string;
}

export default IJoin;
