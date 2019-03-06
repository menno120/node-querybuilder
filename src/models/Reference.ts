import IReference from '../interfaces/IReference';

class Reference implements IReference {
	readonly table: string;
	readonly key: string;

	constructor(table: string, key: string) {
		this.table = table;
		this.key = key;
	}
}

export default Reference;
