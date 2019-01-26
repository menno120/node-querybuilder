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
	var text =
		chalk.magenta("Differences: ") +
		"\r\n\r\n" +
		chalk.white(str1) +
		"\r\n\r\n";

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
		.orderBy("id", "ASC")
		.orWhere("id", 2)
		.orWhere("id", 3)
		.andWhere("username", "test")
		.prepare();

	let test_1_expected =
		"SELECT `tablename`.`id`,`tablename`.`username`,`tablename`.`email` FROM `tablename`  WHERE (`id` = 1 AND `email` = 'someone@example.com') OR (`id` = 2) OR (`id` = 3 AND `username` = 'test') ORDER BY `id` ASC";

	if (test_1.query.trim() !== test_1_expected) {
		failed(
			"#1",
			highlightDifferences(test_1_expected, test_1.query.trim())
		);
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

	let test_2_expected =
		"SELECT COUNT(`id`) AS count FROM `tablename`  WHERE (`type` = 'something')";

	if (test_2.query.trim() !== test_2_expected) {
		failed(
			"#2",
			highlightDifferences(test_2_expected, test_2.query.trim())
		);
	} else {
		passed("#2");
	}
} catch (e) {
	failed("#2", e);
}

// Test #3
try {
	let test_3 = new QueryBuilder()
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
		failed(
			"#4",
			highlightDifferences(test_4_expected, test_4.query.trim())
		);
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
		.whereFulltext(
			"summary,description",
			"Keywords here ...",
			FULLTEXT_MODES.NATURAL_LANGUAGE_MODE
		)
		.limit(0, 20)
		.prepare();

	let test_5_expected =
		"SELECT `tablename`.`id`,`tablename`.`name` FROM `tablename`  WHERE (MATCH (summary,description) AGAINST 'Keywords here ...' IN NATURAL LANGUAGE MODE)  LIMIT 0, 20";
	if (test_5.query.trim() !== test_5_expected) {
		failed(
			"#5",
			highlightDifferences(test_5_expected, test_5.query.trim())
		);
	} else {
		passed("#5");
	}
} catch (e) {
	failed("#5", e);
}

// Test #6
try {
	let test_6 = new QueryBuilder()
		.insert("tablename", { firstame: "John", lastname: "Doe" })
		.prepare();

	let test_6_expected =
		"INSERT INTO `tablename` (`firstame`,`lastname`) VALUES ('John','Doe')";

	if (test_6.query.trim() !== test_6_expected) {
		failed(
			"#6",
			highlightDifferences(test_6_expected, test_6.query.trim())
		);
	} else {
		passed("#6");
	}
} catch (e) {
	failed("#6", e);
}

// Test #7
try {
	let test_7 = new QueryBuilder()
		.update("tablename", { firstame: "John", lastname: "Doe" })
		.where("id", 1)
		.prepare();

	let test_7_expected =
		"UPDATE `tablename` SET `firstame`=John, `lastname`=Doe  WHERE (`id` = 1)";

	if (test_7.query.trim() !== test_7_expected) {
		failed(
			"#7",
			highlightDifferences(test_7_expected, test_7.query.trim())
		);
	} else {
		passed("#7");
	}
} catch (e) {
	failed("#7", e);
}

// Test #8
try {
	let test_8 = new QueryBuilder()
		.delete("tablename")
		.where("id", 1)
		.prepare();

	let test_8_expected = "DELETE FROM `tablename`  WHERE (`id` = 1)";

	if (test_8.query.trim() !== test_8_expected) {
		failed(
			"#8",
			highlightDifferences(test_8_expected, test_8.query.trim())
		);
	} else {
		passed("#8");
	}
} catch (e) {
	failed("#8", e);
}

// Test #9
try {
	let test_9 = new QueryBuilder().truncate("tablename").prepare();

	let test_9_expected = "TRUNCATE `tablename`";

	if (test_9.query.trim() !== test_9_expected) {
		failed(
			"#9",
			highlightDifferences(test_9_expected, test_9.query.trim())
		);
	} else {
		passed("#9");
	}
} catch (e) {
	failed("#9", e);
}

// Test #10
try {
	let test_10 = new QueryBuilder()
		.select("tablename", [])
		.fulltext("title,description", 'text', FULLTEXT_MODES.BOOLEAN_MODE)
		.orderBy('score', 'ASC')
		.prepare()

	let test_10_expected = "SELECT MATCH (title,description) AGAINST 'text' IN BOOLEAN MODE AS score FROM `tablename`   ORDER BY `score` ASC";

	if (test_10.query.trim() !== test_10_expected) {
		failed(
			"#10",
			highlightDifferences(test_10_expected, test_10.query.trim())
		);
	} else {
		passed("#10");
	}
} catch (e) {
	failed("#10", e);
}

console.log("");
console.info(
	"Total tests: " +
		(stats.failed + stats.passed) +
		", Passed: " +
		stats.passed +
		", Failed: " +
		stats.failed
);
console.log("");

if (stats.failed !== 0) {
	console.log(chalk.bgRed.white("One or more test failed."));
} else {
	console.log(chalk.bgGreen.white("All tests passed!"));
}
