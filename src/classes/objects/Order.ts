import Reference from "./Reference";
import { SortOrder } from "../../helpers";

class Order {
	keys: Reference[];
	order: SortOrder;

	constructor(keys: Reference | Reference[], order: SortOrder) {
		let _keys: Reference[];

		if (Array.isArray(keys)) {
			_keys = keys;
		} else {
			if (keys instanceof Reference) {
				_keys.push(keys);
			} else {
				throw new Error('Expected "Reference" object!');
			}
		}

		this.keys = _keys;
		this.order = order;
	}
}

export default Order;
