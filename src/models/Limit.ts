import ILimit from '../../interfaces/ILimit';

class Limit implements ILimit {
	readonly offset: number;
	readonly amount: number;

	constructor(offset: number, amount: number = null) {
		this.offset = offset;
		this.amount = amount;
	}
}

export default Limit;
