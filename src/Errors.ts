export default class CustomError {
	constructor(data: any = null) {
		if (data !== null) {
			console.error(data);
		}
	}
}

export class UnequalAmountOfKeysAndValues extends CustomError {
	constructor(data: any = null) {
		super(data);

		throw {
			name: 'UnequalAmountOfKeys',
			message: 'Expected equal amount of keys and values!'
		};
	}
}

export class NoInitialWhereClause extends CustomError {
	constructor(data: any = null) {
		super(data);

		throw {
			name: 'NoInitialWhereClause',
			message: 'There was no initial where clause found!'
		};
	}
}

export class DuplicateInitialWhereClause extends CustomError {
	constructor(data: any = null) {
		super(data);

		throw {
			name: 'DuplicateInitialWhereClause',
			message: 'There already was an initial where clause!'
		};
	}
}
