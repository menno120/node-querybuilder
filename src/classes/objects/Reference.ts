class Reference {
	readonly tablename: string;
	readonly key: string;

	constructor(tablename: string, key: string) {
		this.tablename = tablename;
		this.key = key;
	}
}

export default Reference;
