import IReference from './IReference';
import { SelectFunction } from '../classes/QueryBuilder';

interface IKey {
	key: IReference;
	as?: string;
	func?: SelectFunction;
}

export default IKey;
