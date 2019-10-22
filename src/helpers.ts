import Reference from './models/Reference';

export const uuid = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (Math.random() * 16) | 0,
			v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

export const reference = (tablename: string, key: string) => {
	return new Reference(tablename, key);
};

export enum JoinType {
	Left = 'LEFT',
	Right = 'RIGHT',
	Inner = 'INNER'
}

export enum WhereType {
	DEFAULT,
	OR,
	AND
}

export enum FulltextMode {
	BooleanMode,
	NaturalLanguageMode
}

export enum SortOrder {
	ASC,
	DESC
}

export enum ComparisonOperators {
	Greater,
	Less,
	NotEquals,
	Equals,
	LessEquals,
	GreaterEquals,
	NullSafeEquals
}

export enum ComparisonFunctions {
	Like,
	Fulltext,
	Between
}

export const operators = {
	comparison: ['=', '<', '>', '<=', '>=', '!=', '<>', '<=>']
};
