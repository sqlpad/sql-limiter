# Changelog

## [3.1.0] - 2024-10-20

- Support injecting offset number
- Add `getStatementClasses` function
- Add `mode` parameter
- Add functions to find limit and offset number token value

## [3.0.0] - 2022-06-30

- Add support for procedure statements with `BEGIN` and `END` blocks. Procedures are considered terminated when a terminator is found following an END keyword. No API changes, but because this does change parsing behavior this is being released as a major version bump.

## [2.6.0] - 2021-03-22

- Add `getStatementType` function

## [2.5.0] - 2021-03-18

- Add support for ClickHouse `LIMIT <offset>, <number>` syntax

## [2.4.0] - 2020-08-07

- Add `top` strategy

## [2.3.0] - 2020-07-17

- Add support for multiline strings
- Fix regex escapes within strings

## [2.2.0] - 2020-06-19

- Add support for non-English identifiers
- Add support for backtick quoted identifiers

## [2.1.1] - 2020-05-31

- Fix Windows line ending detection

## [2.1.0] - 2020-05-15

- Add `FIRST` support back

## [2.0.0] - 2020-05-11

- Added support for `FETCH FIRST/NEXT`, and `LIMIT` at same time
- Enhanced limit detections
- Removed `TOP` support

## [1.0.3] - 2020-05-10

- Fix: Remove `FIRST` from documentation.

## [1.0.2] - 2020-05-10

- Fix: Handle trailing line comment

## [1.0.1] - 2020-05-09

- Fix: Remove `fs`/`path` use to be browser friendly

## [1.0.0] - 2020-05-08

- Initial release
