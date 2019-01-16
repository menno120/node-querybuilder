# Node.js QueryBuilder for MySQL database

Simple to use QueryBuilder


## Instalation:

```
> npm install git+https://github.com/menno120/node-querybuilder.git
```

## Example:

```js

new QueryBuilder()
	.select("users", ["id","username","email"])
	.where("id", 1)
	.andWhere("email", "user@example.com")
	.orWhere("ud", 2)
	.andWhere("email", "user2@example.com")
	.limit(0, 25)
	.orderBy("id", "ASC")
	.orderBy("email", "DESC")
	.prepare()
	.execute((error, result) => {
		if (error !== null) {
			// Error message here ...
		} else {
			// The results variable will contain the results
		}
	});
```