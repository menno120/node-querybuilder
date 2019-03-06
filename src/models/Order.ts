import Reference from './Reference';
import { SortOrder } from '../helpers';
import IOrder from '../interfaces/IOrder';

class Order implements IOrder {
	keys: Reference[];
	order: SortOrder[];

	constructor(keys: Reference | Reference[], order: SortOrder | SortOrder[]) {
		let _keys: Reference[];
		let _order: SortOrder[];

		if (Array.isArray(keys)) {
			_keys = keys;
		} else {
			if (keys instanceof Reference) {
				_keys.push(keys);
			} else {
				throw new Error('Expected "Reference" object!');
			}
		}
		if (Array.isArray(order)) {
			_order = order;
		} else {
			_order.push(order);
		}

		this.keys = _keys;
		this.order = _order;
	}
}

export default Order;
