import { QueryType } from "../classes/QueryBuilder";
import Where from "../classes/objects/Where";
import Order from "../classes/objects/Order";
import Join from "../classes/objects/Join";
import Limit from "../classes/objects/Limit";

interface IQueryBuilder {
	type: QueryType; // Type of query (select,insert,update,delete,truncate)
	table: string; // Table name to select from
	keys: string[]; // Keys to select
	values: string[]; // Names for the keys
	where: Where[]; // Where clauses
	order: Order[]; // Order clauses
	joins: Join[]; // Join clauses
	limit: Limit; // Limit
}

export default IQueryBuilder;
