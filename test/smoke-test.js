const assert = require("assert");
const utils = require("../src/utils");

const query = `
  , ,,
  < <<
  > >>
  . ..
  / //
  ? ??
  : ::
  ; ;;
  \\ \\\\
  | ||
  } }}
  ] ]] [ [[
  { {{
  \` \`\`
  ~ ~~
  ! !!
  @ @@
  # ##
  $ $$
  % %%
  ^ ^^ & && * ** ( (( ) )) _ __ - -- = == + ++
  WITH cte_a (a, b) AS (
    select *
    -- ;;;
    FROM table_a."table_b".[table c]."table d"
    WHERE something LIKE '%_sss%' AND other = ' '' '
  )
  SELECT a::TEXT AS "col a"
  FROM "cte_a"
  where a = 'something' 
  /* comment */
  /*
  comment; /*
  */
    */
`;

describe("smoke test", function () {
  it("tokenizes random", function () {
    const tokens = utils.tokenize(query);
    assert(tokens);
  });
});
