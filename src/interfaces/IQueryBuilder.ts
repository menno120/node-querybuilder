import { QueryType } from '../classes/QueryBuilder';
import Where from '../models/Where';
import Order from '../models/Order';
import Join from '../models/Join';
import Limit from '../models/Limit';
import IKey from './IKey';

interface IQueryBuilder {
	type: QueryType; // Type of query (select,insert,update,delete,truncate)
	table: string; // Table name to select from
	keys: IKey[]; // Keys to select
	values: string[]; // Names for the keys
	where: Where[]; // Where clauses
	order: Order[]; // Order clauses
	joins: Join[]; // Join clauses
	limit: Limit; // Limit
}

export default IQueryBuilder;
