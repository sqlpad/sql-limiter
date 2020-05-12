# sql-limiter

Injects and enforces `LIMIT` (and `FETCH FIRST`, or both!) in your SQL statements. As of v2, `TOP` is no longer supported.

[Try it](https://rickbergfalk.github.io/sql-limiter/)

```js
const sqlLimiter = require("sql-limiter");

const enforcedSql = sqlLimiter.limit(
  `SELECT * FROM some_table limit 999;`,
  ["limit", "fetch"], // limit strategies to detect/enforce
  100 // max allowed limit
);
console.log(enforcedSql); // SELECT * FROM some_table limit 100;
```

It is database agnostic, aiming to support anything that kinda looks like SQL (ANSI or not).

It ignores non-SELECT queries. It understands CTE statements. It understands strings and comments. If you are limiting multiple statements it assumes your SQL statements are terminated by either `;` or `\g`;

## API

### `sqlLimiter.limit( sqlText, limitStrategies, limitNumber )`

- `sqlText` - SQL text to enforce limits on. Multiple statements allowed. Only `SELECT` statements are targeted.
- `limitStrategies` - Keyword or array of keywords used to restrict rows. Must be either `limit` or `fetch` for `FETCH NEXT`/`FETCH FIRST`.
- `limitNumber` - Number of rows to allow. If number in statement is lower, it is untouched. If higher it is lowered to limit. If missing it is added.

Returns `sqlText` with limits enforced.

When an existing limit is not found in a `SELECT` query, `limitStrategies` is used to define priority of strategy used. This is useful for databases that support both, such as Postgres.

#### Example:

```js
// When limit is first
const enforcedSql = sqlLimiter.limit(
  `SELECT * FROM some_table;`,
  ["limit", "fetch"],
  100
);
console.log(enforcedSql); // SELECT * FROM some_table limit 100

// When fetch is first
const enforcedSql = sqlLimiter.limit(
  `SELECT * FROM some_table;`,
  ["limit", "fetch"],
  100
);
console.log(enforcedSql); // SELECT * FROM some_table fetch first 100 rows only;
```

### `sqlLimiter.getStatements( sqlText )`

- `sqlText` - SQL text to parse and split into individual statements.

Returns array of statement strings. Used by `sql-limiter` internally but exposed for your convenience.

### `sqlLimiter.removeTerminator( sqlStatement )`

- `sqlStatement` - Single SQL statement text to remove terminator from.

Returns `sqlStatement` string with terminator removed. Used by `sql-limiter` internally but exposed for your convenience

## Why

`sql-limiter` was initially created to enforce SQL limits in [SQLPad](https://github.com/rickbergfalk/sqlpad).

In SQLPad, users run arbitrary SQL against a database, and the application needs to be protected from `SELECT * FROM really_big_table` queries.

Some database drivers support the ability to stream SQL results, and then terminate the query midstream. Most drivers/databases don't support this however, and for those that do it can be kind of tricky. It also isn't as efficient as telling the database the results are to be limited, as that may impact the query execution plan depending on the database.

## How

The SQL statement is tokenized using the excellent [moo](https://www.npmjs.com/package/moo) package.

The resulting tokens are traversed to attempt to detect and enforce the limit.

This library is _not_ a full fledged SQL parser. You may run into some edge cases depending on your target database. If you run into anything, please open an issue.

## FETCH FIRST/NEXT n ROWS ONLY

Did you know that `LIMIT` is not standard SQL!? I didn't!

It wasn't until SQL:2008 that a formal spec was added. Markus Winand has [a great guide written about this](https://use-the-index-luke.com/sql/partial-results/top-n-queries).

`sql-limiter` will look for `FETCH FIRST <number>` and `FETCH NEXT <number>` to detect the use of `FETCH` use. If neither are found, `FETCH FIRST <number> ROWS ONLY` will be added to the query.

## Why TOP isn't supported

SQL Server's TOP is great for single SELECT queries, but becomes problematic for queries unioned together. `TOP` only applies to the `SELECT` clause it is used in, as opposed to acting on the entire unioned result set. For example:

```sql
-- For SQL Server, this query would return 1,000,005 rows
SELECT TOP 5 * FROM million_row_table
UNION ALL
SELECT * FROM million_row_table

-- In Postgres, this query returns 5 rows
SELECT * FROM million_row_table
UNION ALL
SELECT * FROM million_row_table
LIMIT 5
```

To achieve the same effect as `LIMIT` using `TOP` in SQL Server, you must wrap the query, and put the `TOP` in the wrapping query instead, which can get messy in some scenarios.

`FETCH FIRST` works similar to `LIMIT` in Postgres, and I presume similar in SQL Server 2012, IBM DB2, and Actian's Ingres.

## Contributing

Discover a query that isn't understood as it should be? Know of other terminators? Open an issue and let me know.

Pull requests for **bugs** and **maintenance** always welcome. Please open an issue before opening a PR for new functionality.

## Resources for limiting SQL queries

- [Use the Index Luke - Querying Top N Rows](https://use-the-index-luke.com/sql/partial-results/top-n-queries)
- [Postgres SELECT Synopsis](https://www.postgresql.org/docs/12/sql-select.html)
- [IBM DB2 Fetch First](https://www.ibm.com/support/knowledgecenter/SSEPEK_10.0.0/sqlref/src/tpc/db2z_sql_fetchfirstclause.html)
- [Actian/Ingres Fetch First](https://docs.actian.com/ingres/10s/index.html#page/SQLRef%2FFETCH_FIRST_Clause_and_OFFSET_Clause.htm%23)

## License

MIT
