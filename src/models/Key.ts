import IKey from '../../interfaces/IKey';
import { SelectFunction } from '../QueryBuilder';
import IReference from '../../interfaces/IReference';
import Reference from './Reference';

class Key implements IKey {
	key: IReference;
	as?: string;
	func?: SelectFunction;

	constructor(key: IReference, as: string = null, func: SelectFunction = null) {
		this.key = key;
		this.as = as;
		this.func = func;
	}
}

export default Key;
