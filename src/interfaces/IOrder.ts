import IReference from "./IReference";
import { SortOrder } from "../helpers";

interface IOrder {
	keys: IReference[];
	order: SortOrder[];
}

export default IOrder;
