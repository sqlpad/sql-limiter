# sql-limiter

Injects and enforces `LIMIT` (and `TOP` and `FIRST`) in your SQL statements.

```js
const sqlLimiter = require("sql-limiter");

const enforcedSql = sqlLimiter.limit(
  `SELECT * FROM something limit 999;`,
  "limit", // or `top` or `first` if non-ANSI
  100 // max allowed limit
);
console.log(enforcedSql); // SELECT * FROM something limit 100
```

It is database agnostic, aiming to support anything that kinda looks like SQL (ANSI or not).

It ignores non-SELECT queries. It understands CTE statements. It understands strings and comments. If you are limiting multiple statements it assumes your SQL statements are terminated by either `;` or `\g`;

## API

### `sqlLimiter.limit( sqlText, limitKeyword, limitNumber )`

- `sqlText` - SQL text to enforce limits on. Multiple statements allowed. Only `SELECT` statements are targeted.
- `limitKeyword` - Keyword used to restrict rows. Must be either `limit`, `top`, or `first` (which works like `top`).
- `limitNumber` - Number of rows to allow. If number in statement is lower, it is untouched. If higher it is lowered to limit. If missing it is added.

Returns `sqlText` with limits enforced.

### `sqlLimiter.getStatements( sqlText )`

- `sqlText` - SQL text to parse and split into individual statements.

Returns array of statement strings.

### `sqlLimiter.removeTerminator( sqlStatement )`

- `sqlStatement` - Single SQL statement text to remove terminator from.

Returns `sqlStatement` string with terminator removed.

## Why

`sql-limiter` was initially created to enforce SQL limits in [SQLPad](https://github.com/rickbergfalk/sqlpad).

In SQLPad, users run arbitrary SQL against a database, and the application needs to be protected from `SELECT * FROM really_big_table` queries.

Some database drivers support the ability to stream SQL results, and then terminate the query midstream. Most drivers/databases don't support this however, and for those that do it can be kind of tricky. Does streaming work for `INSERT`/`UPDATE`? Is running a query returning millions of rows and then killing it after some number of rows are received efficient?

## How

The SQL statement is tokenized using the excellent [moo](https://www.npmjs.com/package/moo) package.

The resulting tokens are traversed to attempt to detect and enforce the limit.

This library is _not_ a SQL parser. That can get to be really complex, especially when trying to be database agnostic.

## When NOT to use this

Do not use this library to enforce limits in your application logic, or if you are targeting a specific database.

If you're using an ORM or SQL builder library, your ORM/builder probably has an option to set limits. It'll be a lot more dependable and efficient.

Also look into the database you're targeting. You might have some ability to restrict things at the database level.

## Contributing

Discover a query that isn't understood as it should be? Know of other terminators? Open an issue and let me know.

Pull requests for **bugs** and **maintenance** always welcome. Please open an issue before opening a PR for new functionality.

## License

MIT
