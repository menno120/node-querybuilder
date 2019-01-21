let { QueryBuilder, DatabaseConnection, FULLTEXT_MODES } = require("./index");
let chalk = require("chalk");

let stats = { failed: 0, passed: 0 };
let errors = [];

function failed(test, err) {
	stats.failed++;
	errors.push(err);
	console.info(chalk.red(" [FAILED]: " + test)); // X
	console.log();
	console.log(chalk.bgRed.white("ERROR:"));
	console.error(err);
	console.log();
}
function passed(test) {
	stats.passed++;
	console.info(chalk.green(" [PASSED]: " + test)); // ✔
}
function highlightDifferences(str1, str2) {
	var text = chalk.magenta("Differences: ") + "\r\n\r\n" + chalk.white(str1) + "\r\n\r\n";

	str2.split("").forEach(function(val, i) {
		if (val === str1.charAt(i)) {
			text += chalk.white(val);
		} else {
			text += chalk.bgCyan(val);
		}
	});

	return text;
}

console.log("");
console.info("Starting tests:");
console.log("");

// Test #1
try {
	let test_1 = new QueryBuilder()
		.select("tablename", ["id", "username", "email"])
		.where("id", 1)
		.andWhere("email", "someone@example.com")
		.orderBy("ID", "ASC")
		.orWhere("id", 2)
		.orWhere("id", 3)
		.andWhere("username", "test")
		.prepare();

	let test_1_expected =
		"SELECT `tablename`.`id`,`tablename`.`username`,`tablename`.`email` FROM `tablename`  WHERE (`id` = 1 AND `email` = 'someone@example.com') OR (`id` = 2) OR (`id` = 3 AND `username` = 'test')";

	if (test_1.query.trim() !== test_1_expected) {
		failed("#1", highlightDifferences(test_1_expected, test_1.query.trim()));
	} else {
		passed("#1");
	}
} catch (e) {
	passed("#1", e);
}

// Test #2
try {
	let test_2 = new QueryBuilder()
		.count("tablename", "id")
		.where("type", "something")
		.prepare();

	let test_2_expected = "SELECT COUNT(`id`) as count FROM `tablename`  WHERE (`type` = 'something')";

	if (test_2.query.trim() !== test_2_expected) {
		failed("#2", highlightDifferences(test_2_expected, test_2.query.trim()));
	} else {
		passed("#2");
	}
} catch (e) {
	failed("#2", e);
}

// Test #3
try {
	let test_3 = new QueryBuilder(true)
		.select("tablename", ["id", "name"])
		.whereBetween("age", 18, 99)
		.where("id", 1)
		.limit(0, 20)
		.prepare();
} catch (e) {
	if (
		e
			.toString()
			.trim()
			.startsWith("Error: Please specify the type of where (OR | AND)")
	) {
		passed("#3");
	} else {
		failed("#3", e);
	}
}

// Test #4
try {
	let test_4 = new QueryBuilder()
		.select("tablename", ["id", "name"])
		.leftJoin("tablename2", "id", "tablename.id")
		.rightJoin("tablename3", "id", "tablename.id")
		.innerJoin("tablename4", "id", "tablename.id")
		.where("id", 1)
		.limit(0, 20)
		.prepare();

	let test_4_expected =
		"SELECT `tablename`.`id`,`tablename`.`name` FROM `tablename` LEFT JOIN `tablename2` ON `tablename2`.`id` = `tablename`.`id` RIGHT JOIN `tablename3` ON `tablename3`.`id` = `tablename`.`id` INNER JOIN `tablename4` ON `tablename4`.`id` = `tablename`.`id` WHERE (`id` = 1)  LIMIT 0, 20";
	if (test_4.query.trim() !== test_4_expected) {
		failed("#4", highlightDifferences(test_4_expected, test_4.query.trim()));
	} else {
		passed("#4");
	}
} catch (e) {
	failed("#4", e);
}

// Test #5
try {
	let test_5 = new QueryBuilder()
		.select("tablename", ["id", "name"])
		.whereFulltext("summary,description", "Keywords here ...", FULLTEXT_MODES.NATURAL_LANGUAGE_MODE)
		.limit(0, 20)
		.prepare();

	let test_5_expected =
		"SELECT `tablename`.`id`,`tablename`.`name` FROM `tablename`  WHERE (MATCH (summary,description) AGAINST 'Keywords here ...' IN NATURAL LANGUAGE MODE)  LIMIT 0, 20";
	if (test_5.query.trim() !== test_5_expected) {
		failed("#5", highlightDifferences(test_5_expected, test_5.query.trim()));
	} else {
		passed("#5");
	}
} catch (e) {
	failed("#5", e);
}

console.log("");
console.info(
	"Total tests: " + (stats.failed + stats.passed) + ", Passed: " + stats.passed + ", Failed: " + stats.failed
);
console.log("");

if (stats.failed !== 0) {
	console.log(chalk.bgRed.white("One or more test failed."));
} else {
	console.log(chalk.bgGreen.white("All tests passed!"));
}
