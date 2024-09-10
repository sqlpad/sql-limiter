(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // ../node_modules/moo/moo.js
  var require_moo = __commonJS({
    "../node_modules/moo/moo.js"(exports, module) {
      (function(root, factory) {
        if (typeof define === "function" && define.amd) {
          define([], factory);
        } else if (typeof module === "object" && module.exports) {
          module.exports = factory();
        } else {
          root.moo = factory();
        }
      })(exports, function() {
        "use strict";
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var toString = Object.prototype.toString;
        var hasSticky = typeof new RegExp().sticky === "boolean";
        function isRegExp(o) {
          return o && toString.call(o) === "[object RegExp]";
        }
        function isObject(o) {
          return o && typeof o === "object" && !isRegExp(o) && !Array.isArray(o);
        }
        function reEscape(s) {
          return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        }
        function reGroups(s) {
          var re = new RegExp("|" + s);
          return re.exec("").length - 1;
        }
        function reCapture(s) {
          return "(" + s + ")";
        }
        function reUnion(regexps) {
          if (!regexps.length) return "(?!)";
          var source = regexps.map(function(s) {
            return "(?:" + s + ")";
          }).join("|");
          return "(?:" + source + ")";
        }
        function regexpOrLiteral(obj) {
          if (typeof obj === "string") {
            return "(?:" + reEscape(obj) + ")";
          } else if (isRegExp(obj)) {
            if (obj.ignoreCase) throw new Error("RegExp /i flag not allowed");
            if (obj.global) throw new Error("RegExp /g flag is implied");
            if (obj.sticky) throw new Error("RegExp /y flag is implied");
            if (obj.multiline) throw new Error("RegExp /m flag is implied");
            return obj.source;
          } else {
            throw new Error("Not a pattern: " + obj);
          }
        }
        function pad(s, length) {
          if (s.length > length) {
            return s;
          }
          return Array(length - s.length + 1).join(" ") + s;
        }
        function lastNLines(string, numLines) {
          var position = string.length;
          var lineBreaks = 0;
          while (true) {
            var idx = string.lastIndexOf("\n", position - 1);
            if (idx === -1) {
              break;
            } else {
              lineBreaks++;
            }
            position = idx;
            if (lineBreaks === numLines) {
              break;
            }
            if (position === 0) {
              break;
            }
          }
          var startPosition = lineBreaks < numLines ? 0 : position + 1;
          return string.substring(startPosition).split("\n");
        }
        function objectToRules(object) {
          var keys = Object.getOwnPropertyNames(object);
          var result = [];
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var thing = object[key];
            var rules = [].concat(thing);
            if (key === "include") {
              for (var j = 0; j < rules.length; j++) {
                result.push({ include: rules[j] });
              }
              continue;
            }
            var match = [];
            rules.forEach(function(rule) {
              if (isObject(rule)) {
                if (match.length) result.push(ruleOptions(key, match));
                result.push(ruleOptions(key, rule));
                match = [];
              } else {
                match.push(rule);
              }
            });
            if (match.length) result.push(ruleOptions(key, match));
          }
          return result;
        }
        function arrayToRules(array) {
          var result = [];
          for (var i = 0; i < array.length; i++) {
            var obj = array[i];
            if (obj.include) {
              var include = [].concat(obj.include);
              for (var j = 0; j < include.length; j++) {
                result.push({ include: include[j] });
              }
              continue;
            }
            if (!obj.type) {
              throw new Error("Rule has no type: " + JSON.stringify(obj));
            }
            result.push(ruleOptions(obj.type, obj));
          }
          return result;
        }
        function ruleOptions(type, obj) {
          if (!isObject(obj)) {
            obj = { match: obj };
          }
          if (obj.include) {
            throw new Error("Matching rules cannot also include states");
          }
          var options = {
            defaultType: type,
            lineBreaks: !!obj.error || !!obj.fallback,
            pop: false,
            next: null,
            push: null,
            error: false,
            fallback: false,
            value: null,
            type: null,
            shouldThrow: false
          };
          for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
              options[key] = obj[key];
            }
          }
          if (typeof options.type === "string" && type !== options.type) {
            throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type + "')");
          }
          var match = options.match;
          options.match = Array.isArray(match) ? match : match ? [match] : [];
          options.match.sort(function(a, b) {
            return isRegExp(a) && isRegExp(b) ? 0 : isRegExp(b) ? -1 : isRegExp(a) ? 1 : b.length - a.length;
          });
          return options;
        }
        function toRules(spec) {
          return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec);
        }
        var defaultErrorRule = ruleOptions("error", { lineBreaks: true, shouldThrow: true });
        function compileRules(rules, hasStates) {
          var errorRule = null;
          var fast = /* @__PURE__ */ Object.create(null);
          var fastAllowed = true;
          var unicodeFlag = null;
          var groups = [];
          var parts = [];
          for (var i = 0; i < rules.length; i++) {
            if (rules[i].fallback) {
              fastAllowed = false;
            }
          }
          for (var i = 0; i < rules.length; i++) {
            var options = rules[i];
            if (options.include) {
              throw new Error("Inheritance is not allowed in stateless lexers");
            }
            if (options.error || options.fallback) {
              if (errorRule) {
                if (!options.fallback === !errorRule.fallback) {
                  throw new Error("Multiple " + (options.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options.defaultType + "')");
                } else {
                  throw new Error("fallback and error are mutually exclusive (for token '" + options.defaultType + "')");
                }
              }
              errorRule = options;
            }
            var match = options.match.slice();
            if (fastAllowed) {
              while (match.length && typeof match[0] === "string" && match[0].length === 1) {
                var word = match.shift();
                fast[word.charCodeAt(0)] = options;
              }
            }
            if (options.pop || options.push || options.next) {
              if (!hasStates) {
                throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.defaultType + "')");
              }
              if (options.fallback) {
                throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options.defaultType + "')");
              }
            }
            if (match.length === 0) {
              continue;
            }
            fastAllowed = false;
            groups.push(options);
            for (var j = 0; j < match.length; j++) {
              var obj = match[j];
              if (!isRegExp(obj)) {
                continue;
              }
              if (unicodeFlag === null) {
                unicodeFlag = obj.unicode;
              } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
                throw new Error("If one rule is /u then all must be");
              }
            }
            var pat = reUnion(match.map(regexpOrLiteral));
            var regexp = new RegExp(pat);
            if (regexp.test("")) {
              throw new Error("RegExp matches empty string: " + regexp);
            }
            var groupCount = reGroups(pat);
            if (groupCount > 0) {
              throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: \u2026 ) instead");
            }
            if (!options.lineBreaks && regexp.test("\n")) {
              throw new Error("Rule should declare lineBreaks: " + regexp);
            }
            parts.push(reCapture(pat));
          }
          var fallbackRule = errorRule && errorRule.fallback;
          var flags = hasSticky && !fallbackRule ? "ym" : "gm";
          var suffix = hasSticky || fallbackRule ? "" : "|";
          if (unicodeFlag === true) flags += "u";
          var combined = new RegExp(reUnion(parts) + suffix, flags);
          return { regexp: combined, groups, fast, error: errorRule || defaultErrorRule };
        }
        function compile(rules) {
          var result = compileRules(toRules(rules));
          return new Lexer({ start: result }, "start");
        }
        function checkStateGroup(g, name, map) {
          var state = g && (g.push || g.next);
          if (state && !map[state]) {
            throw new Error("Missing state '" + state + "' (in token '" + g.defaultType + "' of state '" + name + "')");
          }
          if (g && g.pop && +g.pop !== 1) {
            throw new Error("pop must be 1 (in token '" + g.defaultType + "' of state '" + name + "')");
          }
        }
        function compileStates(states, start) {
          var all = states.$all ? toRules(states.$all) : [];
          delete states.$all;
          var keys = Object.getOwnPropertyNames(states);
          if (!start) start = keys[0];
          var ruleMap = /* @__PURE__ */ Object.create(null);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            ruleMap[key] = toRules(states[key]).concat(all);
          }
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var rules = ruleMap[key];
            var included = /* @__PURE__ */ Object.create(null);
            for (var j = 0; j < rules.length; j++) {
              var rule = rules[j];
              if (!rule.include) continue;
              var splice = [j, 1];
              if (rule.include !== key && !included[rule.include]) {
                included[rule.include] = true;
                var newRules = ruleMap[rule.include];
                if (!newRules) {
                  throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')");
                }
                for (var k = 0; k < newRules.length; k++) {
                  var newRule = newRules[k];
                  if (rules.indexOf(newRule) !== -1) continue;
                  splice.push(newRule);
                }
              }
              rules.splice.apply(rules, splice);
              j--;
            }
          }
          var map = /* @__PURE__ */ Object.create(null);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            map[key] = compileRules(ruleMap[key], true);
          }
          for (var i = 0; i < keys.length; i++) {
            var name = keys[i];
            var state = map[name];
            var groups = state.groups;
            for (var j = 0; j < groups.length; j++) {
              checkStateGroup(groups[j], name, map);
            }
            var fastKeys = Object.getOwnPropertyNames(state.fast);
            for (var j = 0; j < fastKeys.length; j++) {
              checkStateGroup(state.fast[fastKeys[j]], name, map);
            }
          }
          return new Lexer(map, start);
        }
        function keywordTransform(map) {
          var isMap = typeof Map !== "undefined";
          var reverseMap = isMap ? /* @__PURE__ */ new Map() : /* @__PURE__ */ Object.create(null);
          var types = Object.getOwnPropertyNames(map);
          for (var i = 0; i < types.length; i++) {
            var tokenType = types[i];
            var item = map[tokenType];
            var keywordList = Array.isArray(item) ? item : [item];
            keywordList.forEach(function(keyword) {
              if (typeof keyword !== "string") {
                throw new Error("keyword must be string (in keyword '" + tokenType + "')");
              }
              if (isMap) {
                reverseMap.set(keyword, tokenType);
              } else {
                reverseMap[keyword] = tokenType;
              }
            });
          }
          return function(k) {
            return isMap ? reverseMap.get(k) : reverseMap[k];
          };
        }
        var Lexer = function(states, state) {
          this.startState = state;
          this.states = states;
          this.buffer = "";
          this.stack = [];
          this.reset();
        };
        Lexer.prototype.reset = function(data, info) {
          this.buffer = data || "";
          this.index = 0;
          this.line = info ? info.line : 1;
          this.col = info ? info.col : 1;
          this.queuedToken = info ? info.queuedToken : null;
          this.queuedText = info ? info.queuedText : "";
          this.queuedThrow = info ? info.queuedThrow : null;
          this.setState(info ? info.state : this.startState);
          this.stack = info && info.stack ? info.stack.slice() : [];
          return this;
        };
        Lexer.prototype.save = function() {
          return {
            line: this.line,
            col: this.col,
            state: this.state,
            stack: this.stack.slice(),
            queuedToken: this.queuedToken,
            queuedText: this.queuedText,
            queuedThrow: this.queuedThrow
          };
        };
        Lexer.prototype.setState = function(state) {
          if (!state || this.state === state) return;
          this.state = state;
          var info = this.states[state];
          this.groups = info.groups;
          this.error = info.error;
          this.re = info.regexp;
          this.fast = info.fast;
        };
        Lexer.prototype.popState = function() {
          this.setState(this.stack.pop());
        };
        Lexer.prototype.pushState = function(state) {
          this.stack.push(this.state);
          this.setState(state);
        };
        var eat = hasSticky ? function(re, buffer) {
          return re.exec(buffer);
        } : function(re, buffer) {
          var match = re.exec(buffer);
          if (match[0].length === 0) {
            return null;
          }
          return match;
        };
        Lexer.prototype._getGroup = function(match) {
          var groupCount = this.groups.length;
          for (var i = 0; i < groupCount; i++) {
            if (match[i + 1] !== void 0) {
              return this.groups[i];
            }
          }
          throw new Error("Cannot find token type for matched text");
        };
        function tokenToString() {
          return this.value;
        }
        Lexer.prototype.next = function() {
          var index = this.index;
          if (this.queuedGroup) {
            var token = this._token(this.queuedGroup, this.queuedText, index);
            this.queuedGroup = null;
            this.queuedText = "";
            return token;
          }
          var buffer = this.buffer;
          if (index === buffer.length) {
            return;
          }
          var group = this.fast[buffer.charCodeAt(index)];
          if (group) {
            return this._token(group, buffer.charAt(index), index);
          }
          var re = this.re;
          re.lastIndex = index;
          var match = eat(re, buffer);
          var error2 = this.error;
          if (match == null) {
            return this._token(error2, buffer.slice(index, buffer.length), index);
          }
          var group = this._getGroup(match);
          var text = match[0];
          if (error2.fallback && match.index !== index) {
            this.queuedGroup = group;
            this.queuedText = text;
            return this._token(error2, buffer.slice(index, match.index), index);
          }
          return this._token(group, text, index);
        };
        Lexer.prototype._token = function(group, text, offset) {
          var lineBreaks = 0;
          if (group.lineBreaks) {
            var matchNL = /\n/g;
            var nl = 1;
            if (text === "\n") {
              lineBreaks = 1;
            } else {
              while (matchNL.exec(text)) {
                lineBreaks++;
                nl = matchNL.lastIndex;
              }
            }
          }
          var token = {
            type: typeof group.type === "function" && group.type(text) || group.defaultType,
            value: typeof group.value === "function" ? group.value(text) : text,
            text,
            toString: tokenToString,
            offset,
            lineBreaks,
            line: this.line,
            col: this.col
          };
          var size = text.length;
          this.index += size;
          this.line += lineBreaks;
          if (lineBreaks !== 0) {
            this.col = size - nl + 1;
          } else {
            this.col += size;
          }
          if (group.shouldThrow) {
            var err = new Error(this.formatError(token, "invalid syntax"));
            throw err;
          }
          if (group.pop) this.popState();
          else if (group.push) this.pushState(group.push);
          else if (group.next) this.setState(group.next);
          return token;
        };
        if (typeof Symbol !== "undefined" && Symbol.iterator) {
          var LexerIterator = function(lexer) {
            this.lexer = lexer;
          };
          LexerIterator.prototype.next = function() {
            var token = this.lexer.next();
            return { value: token, done: !token };
          };
          LexerIterator.prototype[Symbol.iterator] = function() {
            return this;
          };
          Lexer.prototype[Symbol.iterator] = function() {
            return new LexerIterator(this);
          };
        }
        Lexer.prototype.formatError = function(token, message) {
          if (token == null) {
            var text = this.buffer.slice(this.index);
            var token = {
              text,
              offset: this.index,
              lineBreaks: text.indexOf("\n") === -1 ? 0 : 1,
              line: this.line,
              col: this.col
            };
          }
          var numLinesAround = 2;
          var firstDisplayedLine = Math.max(token.line - numLinesAround, 1);
          var lastDisplayedLine = token.line + numLinesAround;
          var lastLineDigits = String(lastDisplayedLine).length;
          var displayedLines = lastNLines(
            this.buffer,
            this.line - token.line + numLinesAround + 1
          ).slice(0, 5);
          var errorLines = [];
          errorLines.push(message + " at line " + token.line + " col " + token.col + ":");
          errorLines.push("");
          for (var i = 0; i < displayedLines.length; i++) {
            var line = displayedLines[i];
            var lineNo = firstDisplayedLine + i;
            errorLines.push(pad(String(lineNo), lastLineDigits) + "  " + line);
            if (lineNo === token.line) {
              errorLines.push(pad("", lastLineDigits + token.col + 1) + "^");
            }
          }
          return errorLines.join("\n");
        };
        Lexer.prototype.clone = function() {
          return new Lexer(this.states, this.state);
        };
        Lexer.prototype.has = function(tokenType) {
          return true;
        };
        return {
          compile,
          states: compileStates,
          error: Object.freeze({ error: true }),
          fallback: Object.freeze({ fallback: true }),
          keywords: keywordTransform
        };
      });
    }
  });

  // ../src/keywords.js
  var require_keywords = __commonJS({
    "../src/keywords.js"(exports, module) {
      module.exports = [
        "absolute",
        "action",
        "ada",
        "add",
        "all",
        "allocate",
        "alter",
        "and",
        "any",
        "are",
        "as",
        "asc",
        "assertion",
        "at",
        "authorization",
        "avg",
        "backup",
        "begin",
        "between",
        "bit_length",
        "bit",
        "both",
        "break",
        "browse",
        "bulk",
        "by",
        "cascade",
        "cascaded",
        "case",
        "cast",
        "catalog",
        "char_length",
        "char",
        "character_length",
        "character",
        "check",
        "checkpoint",
        "close",
        "clustered",
        "coalesce",
        "collate",
        "collation",
        "column",
        "commit",
        "compute",
        "connect",
        "connection",
        "constraint",
        "constraints",
        "contains",
        "containstable",
        "continue",
        "convert",
        "corresponding",
        "count",
        "create",
        "cross",
        "current_date",
        "current_time",
        "current_timestamp",
        "current_user",
        "current",
        "cursor",
        "database",
        "date",
        "day",
        "dbcc",
        "deallocate",
        "dec",
        "decimal",
        "declare",
        "default",
        "deferrable",
        "deferred",
        "delete",
        "deny",
        "desc",
        "describe",
        "descriptor",
        "diagnostics",
        "disconnect",
        "disk",
        "distinct",
        "distributed",
        "domain",
        "double",
        "drop",
        "dump",
        "else",
        "end-exec",
        "end",
        "errlvl",
        "escape",
        "except",
        "exception",
        "exec",
        "execute",
        "exists",
        "exit",
        "external",
        "extract",
        "false",
        "fetch",
        "file",
        "fillfactor",
        "first",
        "float",
        "for",
        "foreign",
        "fortran",
        "found",
        "freetext",
        "freetexttable",
        "from",
        "full",
        "function",
        "get",
        "global",
        "go",
        "goto",
        "grant",
        "group",
        "having",
        "holdlock",
        "hour",
        "identity_insert",
        "identity",
        "identitycol",
        "if",
        "immediate",
        "in",
        "include",
        "index",
        "indicator",
        "initially",
        "inner",
        "input",
        "insensitive",
        "insert",
        "int",
        "integer",
        "intersect",
        "interval",
        "into",
        "is",
        "isolation",
        "join",
        "key",
        "kill",
        "language",
        "last",
        "leading",
        "left",
        "level",
        "like",
        "limit",
        "lineno",
        "load",
        "local",
        "locked",
        "lower",
        "match",
        "max",
        "merge",
        "min",
        "minute",
        "module",
        "month",
        "names",
        "national",
        "natural",
        "nchar",
        "next",
        "no",
        "nocheck",
        "nonclustered",
        "none",
        "not",
        "nowait",
        "null",
        "nullif",
        "numeric",
        "octet_length",
        "of",
        "off",
        "offset",
        "offsets",
        "on",
        "only",
        "open",
        "opendatasource",
        "openquery",
        "openrowset",
        "openxml",
        "option",
        "or",
        "order",
        "outer",
        "output",
        "over",
        "overlaps",
        "pad",
        "partial",
        "pascal",
        "percent",
        "pivot",
        "plan",
        "position",
        "precision",
        "prepare",
        "preserve",
        "primary",
        "print",
        "prior",
        "privileges",
        "proc",
        "procedure",
        "public",
        "raiserror",
        "read",
        "readtext",
        "real",
        "reconfigure",
        "references",
        "relative",
        "replication",
        "restore",
        "restrict",
        "return",
        "revert",
        "revoke",
        "right",
        "right",
        "rollback",
        "row",
        "rowcount",
        "rowguidcol",
        "rows",
        "rule",
        "save",
        "schema",
        "scroll",
        "second",
        "section",
        "securityaudit",
        "select",
        "semantickeyphrasetable",
        "semanticsimilaritydetailstable",
        "semanticsimilaritytable",
        "session_user",
        "session",
        "set",
        "setuser",
        "share",
        "show",
        "shutdown",
        "size",
        "skip",
        "smallint",
        "some",
        "space",
        "sql",
        "sqlca",
        "sqlcode",
        "sqlerror",
        "sqlstate",
        "sqlwarning",
        "statistics",
        "substring",
        "sum",
        "system_user",
        "table",
        "tablesample",
        "temporary",
        "textsize",
        "then",
        "time",
        "timestamp",
        "timezone_hour",
        "timezone_minute",
        "to",
        "top",
        "trailing",
        "tran",
        "transaction",
        "translate",
        "translation",
        "trigger",
        "trim",
        "true",
        "truncate",
        "try_convert",
        "tsequal",
        "union",
        "unique",
        "unknown",
        "unpivot",
        "update",
        "updatetext",
        "upper",
        "usage",
        "use",
        "user",
        "using",
        "value",
        "values",
        "varchar",
        "varying",
        "view",
        "waitfor",
        "when",
        "whenever",
        "where",
        "while",
        "with",
        "within group",
        "work",
        "write",
        "writetext",
        "year",
        "zone"
      ];
    }
  });

  // ../src/create-token.js
  var require_create_token = __commonJS({
    "../src/create-token.js"(exports, module) {
      module.exports = {
        singleSpace() {
          return {
            type: "whitespace",
            text: " ",
            value: " "
          };
        },
        keyword(text) {
          return {
            type: "keyword",
            text,
            value: text.toLowerCase()
          };
        },
        number(n) {
          return {
            type: "number",
            text: `${n}`,
            value: n
          };
        }
      };
    }
  });

  // ../src/token-utils.js
  var require_token_utils = __commonJS({
    "../src/token-utils.js"(exports, module) {
      function findParenLevelToken(tokens, startingIndex, predicate) {
        let level = 0;
        for (let i = startingIndex; i < tokens.length; i++) {
          const token = tokens[i];
          if (!token) {
            return null;
          }
          if (token.type === "lparen") {
            level++;
          } else if (token.type === "rparen") {
            level--;
          } else if (level === 0 && predicate(token)) {
            return { ...token, index: i };
          }
        }
        return null;
      }
      function findToken(tokens, startingIndex, predicate) {
        for (let i = startingIndex; i < tokens.length; i++) {
          const token = tokens[i];
          if (predicate(token)) {
            return { ...token, index: i };
          }
        }
        return null;
      }
      function nextNonCommentNonWhitespace(tokens, startingIndex) {
        return findToken(
          tokens,
          startingIndex,
          (token) => token.type !== "whitespace" && token.type !== "comment"
        );
      }
      function findLimitInsertionIndex(queryTokens, targetParenLevel) {
        let level = 0;
        for (let i = queryTokens.length - 1; i >= 0; i--) {
          const token = queryTokens[i];
          if (level === targetParenLevel && token.type !== "comment" && token.type !== "whitespace") {
            return i + 1;
          }
          if (token.type === "rparen") {
            level++;
          } else if (token.type === "lparen") {
            level--;
          }
        }
        throw new Error("Unexpected index");
      }
      module.exports = {
        findParenLevelToken,
        findToken,
        findLimitInsertionIndex,
        nextNonCommentNonWhitespace
      };
    }
  });

  // ../src/strategies/fetch.js
  var require_fetch = __commonJS({
    "../src/strategies/fetch.js"(exports, module) {
      var createToken = require_create_token();
      var {
        findParenLevelToken,
        findLimitInsertionIndex,
        nextNonCommentNonWhitespace
      } = require_token_utils();
      function has(tokens, startingIndex) {
        const fetchKeywordToken = findParenLevelToken(
          tokens,
          startingIndex,
          (token) => token.type === "keyword" && token.value === "fetch"
        );
        if (!fetchKeywordToken) {
          return null;
        }
        let nextNonWC = nextNonCommentNonWhitespace(
          tokens,
          fetchKeywordToken.index + 1
        );
        if (!nextNonWC) {
          throw new Error("Unexpected end of statement");
        }
        if (nextNonWC.type !== "keyword" || nextNonWC.value !== "next" && nextNonWC.value !== "first") {
          throw new Error(`Unexpected token: ${nextNonWC.type} ${nextNonWC.value}`);
        }
        nextNonWC = nextNonCommentNonWhitespace(tokens, nextNonWC.index + 1);
        if (!nextNonWC) {
          throw new Error("Unexpected end of statement");
        }
        if (nextNonWC.type !== "number") {
          throw new Error(`Expected number got ${nextNonWC.type}`);
        }
        return nextNonWC;
      }
      function add(queryTokens, statementKeywordIndex, targetParenLevel, limit) {
        const insertBeforeToken = findParenLevelToken(
          queryTokens,
          statementKeywordIndex,
          (token) => token.type === "keyword" && token.value === "for"
        );
        const fetchToOnlyTokens = [
          createToken.keyword("fetch"),
          createToken.singleSpace(),
          createToken.keyword("first"),
          createToken.singleSpace(),
          createToken.number(limit),
          createToken.singleSpace(),
          createToken.keyword("rows"),
          createToken.singleSpace(),
          createToken.keyword("only")
        ];
        if (insertBeforeToken) {
          const firstHalf2 = queryTokens.slice(0, insertBeforeToken.index);
          const secondhalf2 = queryTokens.slice(insertBeforeToken.index);
          return [
            ...firstHalf2,
            ...fetchToOnlyTokens,
            createToken.singleSpace(),
            ...secondhalf2
          ];
        }
        const terminatorToken = findParenLevelToken(
          queryTokens,
          statementKeywordIndex,
          (token) => token.type === "terminator"
        );
        if (terminatorToken) {
          const firstHalf2 = queryTokens.slice(0, terminatorToken.index);
          const secondhalf2 = queryTokens.slice(terminatorToken.index);
          return [
            ...firstHalf2,
            createToken.singleSpace(),
            ...fetchToOnlyTokens,
            ...secondhalf2
          ];
        }
        const targetIndex = findLimitInsertionIndex(queryTokens, targetParenLevel);
        const firstHalf = queryTokens.slice(0, targetIndex);
        const secondhalf = queryTokens.slice(targetIndex);
        return [
          ...firstHalf,
          createToken.singleSpace(),
          ...fetchToOnlyTokens,
          ...secondhalf
        ];
      }
      module.exports = {
        has,
        add
      };
    }
  });

  // ../src/strategies/first.js
  var require_first = __commonJS({
    "../src/strategies/first.js"(exports) {
      var createToken = require_create_token();
      var {
        findParenLevelToken,
        nextNonCommentNonWhitespace
      } = require_token_utils();
      function has(tokens, startingIndex) {
        const firstKeywordToken = findParenLevelToken(
          tokens,
          startingIndex,
          (token) => token.type === "keyword" && token.value === "first"
        );
        if (!firstKeywordToken) {
          return null;
        }
        const nextNonWC = nextNonCommentNonWhitespace(
          tokens,
          firstKeywordToken.index + 1
        );
        if (!nextNonWC) {
          throw new Error("Unexpected end of statement");
        }
        if (nextNonWC.type !== "number") {
          throw new Error(`Expected number got ${nextNonWC.type}`);
        }
        return nextNonWC;
      }
      function add(tokens, statementKeywordIndex, targetParenLevel, limitNumber2) {
        const firstHalf = tokens.slice(0, statementKeywordIndex + 1);
        const secondhalf = tokens.slice(statementKeywordIndex + 1);
        return [
          ...firstHalf,
          createToken.singleSpace(),
          createToken.keyword("first"),
          createToken.singleSpace(),
          createToken.number(limitNumber2),
          ...secondhalf
        ];
      }
      exports.has = has;
      exports.add = add;
    }
  });

  // ../src/strategies/limit.js
  var require_limit = __commonJS({
    "../src/strategies/limit.js"(exports) {
      var createToken = require_create_token();
      var {
        findParenLevelToken,
        findLimitInsertionIndex,
        nextNonCommentNonWhitespace
      } = require_token_utils();
      function has(tokens, startingIndex) {
        const limitKeywordToken = findParenLevelToken(
          tokens,
          startingIndex,
          (token) => token.type === "keyword" && token.value === "limit"
        );
        if (!limitKeywordToken) {
          return null;
        }
        const firstNumber = nextNonCommentNonWhitespace(
          tokens,
          limitKeywordToken.index + 1
        );
        if (!firstNumber) {
          throw new Error("Unexpected end of statement");
        }
        if (firstNumber.type !== "number") {
          throw new Error(`Expected number got ${firstNumber.type}`);
        }
        const possibleComma = nextNonCommentNonWhitespace(
          tokens,
          firstNumber.index + 1
        );
        if (!possibleComma) {
          return firstNumber;
        }
        if (possibleComma.type !== "comma") {
          return firstNumber;
        }
        const secondNumber = nextNonCommentNonWhitespace(
          tokens,
          possibleComma.index + 1
        );
        if (!secondNumber) {
          throw new Error("Unexpected end of statement");
        }
        if (secondNumber.type !== "number") {
          throw new Error(`Expected number got ${secondNumber.type}`);
        }
        return secondNumber;
      }
      function add(queryTokens, statementKeywordIndex, targetParenLevel, limit) {
        const insertBeforeToken = findParenLevelToken(
          queryTokens,
          statementKeywordIndex,
          (token) => token.type === "keyword" && (token.value === "offset" || token.value === "for")
        );
        if (insertBeforeToken) {
          const firstHalf2 = queryTokens.slice(0, insertBeforeToken.index);
          const secondhalf2 = queryTokens.slice(insertBeforeToken.index);
          return [
            ...firstHalf2,
            createToken.keyword("limit"),
            createToken.singleSpace(),
            createToken.number(limit),
            createToken.singleSpace(),
            ...secondhalf2
          ];
        }
        const terminatorToken = findParenLevelToken(
          queryTokens,
          statementKeywordIndex,
          (token) => token.type === "terminator"
        );
        if (terminatorToken) {
          const firstHalf2 = queryTokens.slice(0, terminatorToken.index);
          const secondhalf2 = queryTokens.slice(terminatorToken.index);
          return [
            ...firstHalf2,
            createToken.singleSpace(),
            createToken.keyword("limit"),
            createToken.singleSpace(),
            createToken.number(limit),
            ...secondhalf2
          ];
        }
        const targetIndex = findLimitInsertionIndex(queryTokens, targetParenLevel);
        const firstHalf = queryTokens.slice(0, targetIndex);
        const secondhalf = queryTokens.slice(targetIndex);
        return [
          ...firstHalf,
          createToken.singleSpace(),
          createToken.keyword("limit"),
          createToken.singleSpace(),
          createToken.number(limit),
          ...secondhalf
        ];
      }
      exports.has = has;
      exports.add = add;
    }
  });

  // ../src/strategies/top.js
  var require_top = __commonJS({
    "../src/strategies/top.js"(exports) {
      var createToken = require_create_token();
      var {
        findParenLevelToken,
        nextNonCommentNonWhitespace
      } = require_token_utils();
      function has(tokens, startingIndex) {
        const topKeywordToken = findParenLevelToken(
          tokens,
          startingIndex,
          (token) => token.type === "keyword" && token.value === "top"
        );
        if (!topKeywordToken) {
          return null;
        }
        const nextNonWC = nextNonCommentNonWhitespace(
          tokens,
          topKeywordToken.index + 1
        );
        if (!nextNonWC) {
          throw new Error("Unexpected end of statement");
        }
        if (nextNonWC.type !== "number") {
          throw new Error(`Expected number got ${nextNonWC.type}`);
        }
        return nextNonWC;
      }
      function add(tokens, statementKeywordIndex, targetParenLevel, limitNumber2) {
        const firstHalf = tokens.slice(0, statementKeywordIndex + 1);
        const secondhalf = tokens.slice(statementKeywordIndex + 1);
        return [
          ...firstHalf,
          createToken.singleSpace(),
          createToken.keyword("top"),
          createToken.singleSpace(),
          createToken.number(limitNumber2),
          ...secondhalf
        ];
      }
      exports.has = has;
      exports.add = add;
    }
  });

  // ../src/strategies/index.js
  var require_strategies = __commonJS({
    "../src/strategies/index.js"(exports, module) {
      var fetch = require_fetch();
      var first = require_first();
      var limit = require_limit();
      var top = require_top();
      module.exports = {
        fetch,
        first,
        limit,
        top
      };
    }
  });

  // ../src/offset.js
  var require_offset = __commonJS({
    "../src/offset.js"(exports) {
      var createToken = require_create_token();
      var {
        findParenLevelToken,
        nextNonCommentNonWhitespace
      } = require_token_utils();
      function has(tokens, startingIndex) {
        const limitKeywordToken = findParenLevelToken(
          tokens,
          startingIndex,
          (token) => token.type === "keyword" && token.value === "limit"
        );
        if (!limitKeywordToken) {
          const offsetKeywordToken = findParenLevelToken(
            tokens,
            startingIndex,
            (token) => token.type === "keyword" && token.value === "offset"
          );
          if (!offsetKeywordToken) {
            return null;
          }
          const offsetNumberToken = nextNonCommentNonWhitespace(
            tokens,
            offsetKeywordToken.index + 1
          );
          if (!offsetNumberToken) {
            throw new Error("Unexpected end of statement");
          }
          if (offsetNumberToken.type !== "number") {
            throw new Error(`Expected number got ${firstNumber.type}`);
          }
          const rowsToken = nextNonCommentNonWhitespace(
            tokens,
            offsetNumberToken.index + 1
          );
          if (!rowsToken) {
            throw new Error("Expected ROW or ROWS after offset_number");
          }
          if (rowsToken && (rowsToken.value === "row" || rowsToken.value === "rows")) {
            return offsetNumberToken;
          }
        }
        const firstNumber = nextNonCommentNonWhitespace(
          tokens,
          limitKeywordToken.index + 1
        );
        if (!firstNumber) {
          throw new Error("Unexpected end of statement");
        }
        if (firstNumber.type !== "number") {
          throw new Error(`Expected number got ${firstNumber.type}`);
        }
        const possibleCommaOrOffset = nextNonCommentNonWhitespace(
          tokens,
          firstNumber.index + 1
        );
        if (possibleCommaOrOffset) {
          if (possibleCommaOrOffset.type === "comma") {
            const secondNumber = nextNonCommentNonWhitespace(
              tokens,
              possibleCommaOrOffset.index + 1
            );
            if (!secondNumber) {
              throw new Error("Unexpected end of statement");
            }
            if (secondNumber.type !== "number") {
              throw new Error(`Expected number got ${secondNumber.type}`);
            }
            return firstNumber;
          } else if (possibleCommaOrOffset.type === "keyword" && possibleCommaOrOffset.value === "offset") {
            const offsetNumber = nextNonCommentNonWhitespace(
              tokens,
              possibleCommaOrOffset.index + 1
            );
            if (!offsetNumber) {
              throw new Error("Unexpected end of statement");
            }
            if (offsetNumber.type !== "number") {
              throw new Error(`Expected number got ${offsetNumber.type}`);
            }
            return offsetNumber;
          }
        }
        return null;
      }
      function add(queryTokens, statementKeywordIndex, offset) {
        const limitToken = findParenLevelToken(
          queryTokens,
          statementKeywordIndex,
          (token) => token.type === "keyword" && token.value === "limit"
        );
        if (limitToken) {
          const nextToken = nextNonCommentNonWhitespace(
            queryTokens,
            limitToken.index + 2
          );
          const firstHalf = queryTokens.slice(0, nextToken.index + 1);
          const secondHalf = queryTokens.slice(nextToken.index + 1);
          return [
            ...firstHalf,
            createToken.singleSpace(),
            createToken.keyword("offset"),
            createToken.singleSpace(),
            createToken.number(offset),
            ...secondHalf
          ];
        }
        return;
      }
      exports.has = has;
      exports.add = add;
    }
  });

  // ../src/statement.js
  var require_statement = __commonJS({
    "../src/statement.js"(exports, module) {
      var strategies2 = require_strategies();
      var offset = require_offset();
      var Statement = class {
        constructor() {
          this.endReached = false;
          this.isProcedure = false;
          this.tokens = [];
          this.parenLevel = 0;
          this.beginCount = 0;
          this.endCount = 0;
          this.targetParenLevel = null;
          this.statementToken = null;
          this.fetchToken = null;
          this.limitToken = null;
        }
        /**
         * Returns the statement type keyword in lower case.
         * If CTE is detected, the first keywords after WITH and AS is returned
         * @returns string
         */
        getStatementType() {
          if (this.statementToken) {
            return this.statementToken.value;
          }
          return void 0;
        }
        appendToken(t) {
          const token = { ...t };
          token.parenLevel = this.parenLevel;
          token.index = this.tokens.length;
          this.tokens.push(token);
          if (token.type === "keyword" && token.value === "begin") {
            this.beginCount++;
          } else if (token.type === "keyword" && token.value === "end") {
            this.endCount++;
          }
          if (token.type === "terminator" && this.beginCount === this.endCount) {
            if (this.isProcedure && this.endCount > 0 || !this.isProcedure) {
              this.endReached = true;
            }
          } else if (token.type === "lparen") {
            this.parenLevel++;
          } else if (token.type === "rparen") {
            this.parenLevel--;
          } else if (token.type === "keyword") {
            if (token.value === "procedure") {
              this.isProcedure = true;
            }
            if (this.targetParenLevel === null) {
              this.targetParenLevel = this.parenLevel;
            }
            if (!this.statementToken && this.targetParenLevel === this.parenLevel && token.value !== "with" && token.value !== "as") {
              this.statementToken = token;
            }
          }
        }
        updateExistingNumberToken({ mode, tokens, numberToken, value }) {
          const currentNumber = parseInt(numberToken.value, 10);
          if (mode === "cap" && currentNumber > value || mode === "replace") {
            const firstHalf = tokens.slice(0, numberToken.index);
            const secondhalf = tokens.slice(numberToken.index + 1);
            this.tokens = [
              ...firstHalf,
              { ...numberToken, text: value, value },
              ...secondhalf
            ];
          }
        }
        findLimitNumberToken(strategiesToFind) {
          const { statementToken, tokens } = this;
          for (const toFind of strategiesToFind) {
            const strategyImplementation = strategies2[toFind];
            const numberToken = strategyImplementation.has(
              tokens,
              statementToken.index
            );
            if (numberToken) return numberToken;
          }
        }
        /**
         *
         * @param {Array<String>} strategiesToEnforce
         * @param {Number} limitNumber
         *  @param {string} [mode]
         */
        enforceLimit(strategiesToEnforce, limitNumber2, mode) {
          const { statementToken, tokens } = this;
          strategiesToEnforce.forEach((s) => {
            if (!strategies2[s]) {
              throw new Error(`Strategy ${s} not supported`);
            }
          });
          if (statementToken && statementToken.value === "select") {
            const numberToken = this.findLimitNumberToken(strategiesToEnforce);
            if (numberToken) {
              this.updateExistingNumberToken({
                mode,
                tokens,
                numberToken,
                value: limitNumber2
              });
              return;
            }
            const preferredStrategy = strategiesToEnforce[0];
            this.tokens = strategies2[preferredStrategy].add(
              tokens,
              statementToken.index,
              statementToken.parenLevel,
              limitNumber2
            );
            return limitNumber2;
          }
        }
        findOffsetNumberToken() {
          const { statementToken, tokens } = this;
          return offset.has(tokens, statementToken.index);
        }
        /**
         * @param {number} offsetNumber
         * @param {string} [mode]
         */
        enforceOffset(offsetNumber, mode) {
          const { statementToken, tokens } = this;
          if (statementToken && statementToken.value === "select") {
            const numberToken = this.findOffsetNumberToken();
            if (numberToken) {
              this.updateExistingNumberToken({
                mode,
                tokens,
                numberToken,
                value: offsetNumber
              });
              return;
            }
            this.tokens = offset.add(tokens, statementToken.index, offsetNumber);
            return offsetNumber;
          }
        }
        toString(stripTerminator = false) {
          if (stripTerminator) {
            return this.tokens.filter((t) => t.type !== "terminator").map((t) => t.text).join("");
          }
          return this.tokens.map((token) => token.text).join("");
        }
      };
      module.exports = Statement;
    }
  });

  // ../src/get-statements.js
  var require_get_statements = __commonJS({
    "../src/get-statements.js"(exports, module) {
      var moo = require_moo();
      var keywords = require_keywords();
      var Statement = require_statement();
      var caseInsensitiveKeywords = (defs) => {
        const defineKeywords = moo.keywords(defs);
        return (value) => defineKeywords(value.toLowerCase());
      };
      var lexer = moo.compile({
        whitespace: [
          /[ \t]+/u,
          { match: /\r\n/u, lineBreaks: true },
          { match: /\n/u, lineBreaks: true }
        ],
        // First expression is --line comment, second is /* multi line */
        comment: [/--.*?$/u, /\/\*[^]*?\*\//u],
        lparen: "(",
        rparen: ")",
        comma: ",",
        period: ".",
        number: /0|[1-9][0-9]*/u,
        // ; is standard, \g is a shortcut used in psql and Actian tooling
        // Are there others?
        terminator: [";", "\\g"],
        // text == original text
        // value == value inside quotes
        quotedIdentifier: [
          {
            match: /".*?"/u,
            value: (x) => x.slice(1, -1)
          },
          {
            match: /\[.*?\]/u,
            value: (x) => x.slice(1, -1)
          },
          {
            match: /`.*?`/u,
            value: (x) => x.slice(1, -1)
          }
        ],
        // Updated to allow multi-line strings,
        // which is allowed by some database drivers (sqlite, actian)
        // This does not correctly handle escaped doublequotes, however the end result is ok for sql-limiter
        // Instead of a single string token we get 2 separate string tokens back-to-back
        string: [
          {
            match: /'[^']*'/u,
            lineBreaks: true
          }
        ],
        // Remaining test is assumed to be an identifier of some kinds (column or table)
        // UNLESS it matches a keyword case insensitively
        // The value of these tokens are converted to lower case
        identifier: [
          {
            // This is added to handle non-english identifiers.
            // This range may be too broad
            // eslint-disable-next-line no-control-regex
            match: /(?:\w|[^\u0000-\u007F])+/u,
            type: caseInsensitiveKeywords({
              keyword: keywords
            }),
            value: (s) => s.toLowerCase()
          }
        ],
        // Any combination of special characters is to be treated as an operator (as a guess anyways)
        // Initially these were being noted here but the list is large
        // and there is no way to know all operators since this supports anything that is SQL-ish
        operator: {
          match: /[<>~!@#$%^?&|`*\-{}+=:/\\[\]]+/u,
          lineBreaks: false
        }
      });
      function getStatements(sqlText) {
        const statements = [];
        let statement = new Statement();
        lexer.reset(sqlText);
        let next = lexer.next();
        while (next) {
          statement.appendToken(next);
          if (statement.endReached) {
            statements.push(statement);
            statement = new Statement();
          }
          next = lexer.next();
        }
        if (statement.tokens.length) {
          statements.push(statement);
        }
        return statements;
      }
      module.exports = getStatements;
    }
  });

  // ../src/index.js
  var require_src = __commonJS({
    "../src/index.js"(exports, module) {
      var getStatements = require_get_statements();
      function limit(sqlText, limitStrategies2, limitNumber2, offsetNumber, mode = "cap") {
        if (typeof sqlText !== "string") {
          throw new Error("sqlText must be string");
        }
        if (typeof limitNumber2 !== "number") {
          throw new Error("limitNumber must be number");
        }
        let strategies2 = typeof limitStrategies2 === "string" ? [limitStrategies2] : limitStrategies2;
        if (!Array.isArray(strategies2)) {
          throw new Error("limitStrategies must be an array or string");
        }
        if (strategies2.length === 0) {
          throw new Error("limitStrategies must not be empty");
        }
        strategies2 = strategies2.map((s) => s.toLowerCase());
        return getStatements(sqlText).map((statement) => {
          statement.enforceLimit(strategies2, limitNumber2, mode);
          if (typeof offsetNumber === "number") {
            statement.enforceOffset(offsetNumber, mode);
          }
          return statement.toString();
        }).join("");
      }
      function apiGetStatements(sqlText) {
        if (typeof sqlText !== "string") {
          throw new Error("sqlText must be string");
        }
        const statements = getStatements(sqlText);
        return statements.map((statement) => statement.toString());
      }
      function getStatementClasses(sqlText) {
        if (typeof sqlText !== "string") {
          throw new Error("sqlText must be string");
        }
        return getStatements(sqlText);
      }
      function removeTerminator(sqlStatement) {
        if (typeof sqlStatement !== "string") {
          throw new Error("sqlText must be string");
        }
        const statements = getStatements(sqlStatement).map((s) => s.toString(true)).filter((s) => s.trim() !== "");
        if (statements.length > 1) {
          throw new Error("Multiple statements detected");
        }
        return statements[0];
      }
      function getStatementType(sqlStatement) {
        if (typeof sqlStatement !== "string") {
          throw new Error("sqlText must be string");
        }
        const statementObjects = getStatements(sqlStatement).filter(
          (s) => s.toString().trim() !== ""
        );
        if (statementObjects.length > 1) {
          throw new Error("Multiple statements detected");
        }
        return statementObjects[0].getStatementType();
      }
      module.exports = {
        getStatements: apiGetStatements,
        getStatementClasses,
        getStatementType,
        limit,
        removeTerminator
      };
    }
  });

  // node_modules/text-diff/diff.js
  var require_diff = __commonJS({
    "node_modules/text-diff/diff.js"(exports, module) {
      function diff2(options) {
        var options = options || {};
        this.Timeout = options.timeout || 1;
        this.EditCost = options.editCost || 4;
      }
      var DIFF_DELETE = -1;
      var DIFF_INSERT = 1;
      var DIFF_EQUAL = 0;
      diff2.Diff;
      diff2.prototype.main = function(text1, text2, opt_checklines, opt_deadline) {
        if (typeof opt_deadline == "undefined") {
          if (this.Timeout <= 0) {
            opt_deadline = Number.MAX_VALUE;
          } else {
            opt_deadline = (/* @__PURE__ */ new Date()).getTime() + this.Timeout * 1e3;
          }
        }
        var deadline = opt_deadline;
        if (text1 == null || text2 == null) {
          throw new Error("Null input. (diff_main)");
        }
        if (text1 == text2) {
          if (text1) {
            return [[DIFF_EQUAL, text1]];
          }
          return [];
        }
        if (typeof opt_checklines == "undefined") {
          opt_checklines = true;
        }
        var checklines = opt_checklines;
        var commonlength = this.commonPrefix(text1, text2);
        var commonprefix = text1.substring(0, commonlength);
        text1 = text1.substring(commonlength);
        text2 = text2.substring(commonlength);
        commonlength = this.commonSuffix(text1, text2);
        var commonsuffix = text1.substring(text1.length - commonlength);
        text1 = text1.substring(0, text1.length - commonlength);
        text2 = text2.substring(0, text2.length - commonlength);
        var diffs = this.compute_(text1, text2, checklines, deadline);
        if (commonprefix) {
          diffs.unshift([DIFF_EQUAL, commonprefix]);
        }
        if (commonsuffix) {
          diffs.push([DIFF_EQUAL, commonsuffix]);
        }
        this.cleanupMerge(diffs);
        return diffs;
      };
      diff2.prototype.compute_ = function(text1, text2, checklines, deadline) {
        var diffs;
        if (!text1) {
          return [[DIFF_INSERT, text2]];
        }
        if (!text2) {
          return [[DIFF_DELETE, text1]];
        }
        var longtext = text1.length > text2.length ? text1 : text2;
        var shorttext = text1.length > text2.length ? text2 : text1;
        var i = longtext.indexOf(shorttext);
        if (i != -1) {
          diffs = [
            [DIFF_INSERT, longtext.substring(0, i)],
            [DIFF_EQUAL, shorttext],
            [DIFF_INSERT, longtext.substring(i + shorttext.length)]
          ];
          if (text1.length > text2.length) {
            diffs[0][0] = diffs[2][0] = DIFF_DELETE;
          }
          return diffs;
        }
        if (shorttext.length == 1) {
          return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
        }
        var hm = this.halfMatch_(text1, text2);
        if (hm) {
          var text1_a = hm[0];
          var text1_b = hm[1];
          var text2_a = hm[2];
          var text2_b = hm[3];
          var mid_common = hm[4];
          var diffs_a = this.main(text1_a, text2_a, checklines, deadline);
          var diffs_b = this.main(text1_b, text2_b, checklines, deadline);
          return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
        }
        if (checklines && text1.length > 100 && text2.length > 100) {
          return this.lineMode_(text1, text2, deadline);
        }
        return this.bisect_(text1, text2, deadline);
      };
      diff2.prototype.lineMode_ = function(text1, text2, deadline) {
        var a = this.linesToChars_(text1, text2);
        text1 = a.chars1;
        text2 = a.chars2;
        var linearray = a.lineArray;
        var diffs = this.main(text1, text2, false, deadline);
        this.charsToLines_(diffs, linearray);
        this.cleanupSemantic(diffs);
        diffs.push([DIFF_EQUAL, ""]);
        var pointer = 0;
        var count_delete = 0;
        var count_insert = 0;
        var text_delete = "";
        var text_insert = "";
        while (pointer < diffs.length) {
          switch (diffs[pointer][0]) {
            case DIFF_INSERT:
              count_insert++;
              text_insert += diffs[pointer][1];
              break;
            case DIFF_DELETE:
              count_delete++;
              text_delete += diffs[pointer][1];
              break;
            case DIFF_EQUAL:
              if (count_delete >= 1 && count_insert >= 1) {
                diffs.splice(
                  pointer - count_delete - count_insert,
                  count_delete + count_insert
                );
                pointer = pointer - count_delete - count_insert;
                var a = this.main(text_delete, text_insert, false, deadline);
                for (var j = a.length - 1; j >= 0; j--) {
                  diffs.splice(pointer, 0, a[j]);
                }
                pointer = pointer + a.length;
              }
              count_insert = 0;
              count_delete = 0;
              text_delete = "";
              text_insert = "";
              break;
          }
          pointer++;
        }
        diffs.pop();
        return diffs;
      };
      diff2.prototype.bisect_ = function(text1, text2, deadline) {
        var text1_length = text1.length;
        var text2_length = text2.length;
        var max_d = Math.ceil((text1_length + text2_length) / 2);
        var v_offset = max_d;
        var v_length = 2 * max_d;
        var v1 = new Array(v_length);
        var v2 = new Array(v_length);
        for (var x = 0; x < v_length; x++) {
          v1[x] = -1;
          v2[x] = -1;
        }
        v1[v_offset + 1] = 0;
        v2[v_offset + 1] = 0;
        var delta = text1_length - text2_length;
        var front = delta % 2 != 0;
        var k1start = 0;
        var k1end = 0;
        var k2start = 0;
        var k2end = 0;
        for (var d = 0; d < max_d; d++) {
          if ((/* @__PURE__ */ new Date()).getTime() > deadline) {
            break;
          }
          for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
            var k1_offset = v_offset + k1;
            var x1;
            if (k1 == -d || k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1]) {
              x1 = v1[k1_offset + 1];
            } else {
              x1 = v1[k1_offset - 1] + 1;
            }
            var y1 = x1 - k1;
            while (x1 < text1_length && y1 < text2_length && text1.charAt(x1) == text2.charAt(y1)) {
              x1++;
              y1++;
            }
            v1[k1_offset] = x1;
            if (x1 > text1_length) {
              k1end += 2;
            } else if (y1 > text2_length) {
              k1start += 2;
            } else if (front) {
              var k2_offset = v_offset + delta - k1;
              if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
                var x2 = text1_length - v2[k2_offset];
                if (x1 >= x2) {
                  return this.bisectSplit_(text1, text2, x1, y1, deadline);
                }
              }
            }
          }
          for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
            var k2_offset = v_offset + k2;
            var x2;
            if (k2 == -d || k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1]) {
              x2 = v2[k2_offset + 1];
            } else {
              x2 = v2[k2_offset - 1] + 1;
            }
            var y2 = x2 - k2;
            while (x2 < text1_length && y2 < text2_length && text1.charAt(text1_length - x2 - 1) == text2.charAt(text2_length - y2 - 1)) {
              x2++;
              y2++;
            }
            v2[k2_offset] = x2;
            if (x2 > text1_length) {
              k2end += 2;
            } else if (y2 > text2_length) {
              k2start += 2;
            } else if (!front) {
              var k1_offset = v_offset + delta - k2;
              if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
                var x1 = v1[k1_offset];
                var y1 = v_offset + x1 - k1_offset;
                x2 = text1_length - x2;
                if (x1 >= x2) {
                  return this.bisectSplit_(text1, text2, x1, y1, deadline);
                }
              }
            }
          }
        }
        return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
      };
      diff2.prototype.bisectSplit_ = function(text1, text2, x, y, deadline) {
        var text1a = text1.substring(0, x);
        var text2a = text2.substring(0, y);
        var text1b = text1.substring(x);
        var text2b = text2.substring(y);
        var diffs = this.main(text1a, text2a, false, deadline);
        var diffsb = this.main(text1b, text2b, false, deadline);
        return diffs.concat(diffsb);
      };
      diff2.prototype.linesToChars_ = function(text1, text2) {
        var lineArray = [];
        var lineHash = {};
        lineArray[0] = "";
        function diff_linesToCharsMunge_(text) {
          var chars = "";
          var lineStart = 0;
          var lineEnd = -1;
          var lineArrayLength = lineArray.length;
          while (lineEnd < text.length - 1) {
            lineEnd = text.indexOf("\n", lineStart);
            if (lineEnd == -1) {
              lineEnd = text.length - 1;
            }
            var line = text.substring(lineStart, lineEnd + 1);
            lineStart = lineEnd + 1;
            if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) : lineHash[line] !== void 0) {
              chars += String.fromCharCode(lineHash[line]);
            } else {
              chars += String.fromCharCode(lineArrayLength);
              lineHash[line] = lineArrayLength;
              lineArray[lineArrayLength++] = line;
            }
          }
          return chars;
        }
        var chars1 = diff_linesToCharsMunge_(text1);
        var chars2 = diff_linesToCharsMunge_(text2);
        return { chars1, chars2, lineArray };
      };
      diff2.prototype.charsToLines_ = function(diffs, lineArray) {
        for (var x = 0; x < diffs.length; x++) {
          var chars = diffs[x][1];
          var text = [];
          for (var y = 0; y < chars.length; y++) {
            text[y] = lineArray[chars.charCodeAt(y)];
          }
          diffs[x][1] = text.join("");
        }
      };
      diff2.prototype.commonPrefix = function(text1, text2) {
        if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
          return 0;
        }
        var pointermin = 0;
        var pointermax = Math.min(text1.length, text2.length);
        var pointermid = pointermax;
        var pointerstart = 0;
        while (pointermin < pointermid) {
          if (text1.substring(pointerstart, pointermid) == text2.substring(pointerstart, pointermid)) {
            pointermin = pointermid;
            pointerstart = pointermin;
          } else {
            pointermax = pointermid;
          }
          pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
        }
        return pointermid;
      };
      diff2.prototype.commonSuffix = function(text1, text2) {
        if (!text1 || !text2 || text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
          return 0;
        }
        var pointermin = 0;
        var pointermax = Math.min(text1.length, text2.length);
        var pointermid = pointermax;
        var pointerend = 0;
        while (pointermin < pointermid) {
          if (text1.substring(text1.length - pointermid, text1.length - pointerend) == text2.substring(text2.length - pointermid, text2.length - pointerend)) {
            pointermin = pointermid;
            pointerend = pointermin;
          } else {
            pointermax = pointermid;
          }
          pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
        }
        return pointermid;
      };
      diff2.prototype.commonOverlap_ = function(text1, text2) {
        var text1_length = text1.length;
        var text2_length = text2.length;
        if (text1_length == 0 || text2_length == 0) {
          return 0;
        }
        if (text1_length > text2_length) {
          text1 = text1.substring(text1_length - text2_length);
        } else if (text1_length < text2_length) {
          text2 = text2.substring(0, text1_length);
        }
        var text_length = Math.min(text1_length, text2_length);
        if (text1 == text2) {
          return text_length;
        }
        var best = 0;
        var length = 1;
        while (true) {
          var pattern = text1.substring(text_length - length);
          var found = text2.indexOf(pattern);
          if (found == -1) {
            return best;
          }
          length += found;
          if (found == 0 || text1.substring(text_length - length) == text2.substring(0, length)) {
            best = length;
            length++;
          }
        }
      };
      diff2.prototype.halfMatch_ = function(text1, text2) {
        if (this.Timeout <= 0) {
          return null;
        }
        var longtext = text1.length > text2.length ? text1 : text2;
        var shorttext = text1.length > text2.length ? text2 : text1;
        if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
          return null;
        }
        var dmp = this;
        function diff_halfMatchI_(longtext2, shorttext2, i) {
          var seed = longtext2.substring(i, i + Math.floor(longtext2.length / 4));
          var j = -1;
          var best_common = "";
          var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
          while ((j = shorttext2.indexOf(seed, j + 1)) != -1) {
            var prefixLength = dmp.commonPrefix(
              longtext2.substring(i),
              shorttext2.substring(j)
            );
            var suffixLength = dmp.commonSuffix(
              longtext2.substring(0, i),
              shorttext2.substring(0, j)
            );
            if (best_common.length < suffixLength + prefixLength) {
              best_common = shorttext2.substring(j - suffixLength, j) + shorttext2.substring(j, j + prefixLength);
              best_longtext_a = longtext2.substring(0, i - suffixLength);
              best_longtext_b = longtext2.substring(i + prefixLength);
              best_shorttext_a = shorttext2.substring(0, j - suffixLength);
              best_shorttext_b = shorttext2.substring(j + prefixLength);
            }
          }
          if (best_common.length * 2 >= longtext2.length) {
            return [
              best_longtext_a,
              best_longtext_b,
              best_shorttext_a,
              best_shorttext_b,
              best_common
            ];
          } else {
            return null;
          }
        }
        var hm1 = diff_halfMatchI_(
          longtext,
          shorttext,
          Math.ceil(longtext.length / 4)
        );
        var hm2 = diff_halfMatchI_(
          longtext,
          shorttext,
          Math.ceil(longtext.length / 2)
        );
        var hm;
        if (!hm1 && !hm2) {
          return null;
        } else if (!hm2) {
          hm = hm1;
        } else if (!hm1) {
          hm = hm2;
        } else {
          hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
        }
        var text1_a, text1_b, text2_a, text2_b;
        if (text1.length > text2.length) {
          text1_a = hm[0];
          text1_b = hm[1];
          text2_a = hm[2];
          text2_b = hm[3];
        } else {
          text2_a = hm[0];
          text2_b = hm[1];
          text1_a = hm[2];
          text1_b = hm[3];
        }
        var mid_common = hm[4];
        return [text1_a, text1_b, text2_a, text2_b, mid_common];
      };
      diff2.prototype.cleanupSemantic = function(diffs) {
        var changes = false;
        var equalities = [];
        var equalitiesLength = 0;
        var lastequality = null;
        var pointer = 0;
        var length_insertions1 = 0;
        var length_deletions1 = 0;
        var length_insertions2 = 0;
        var length_deletions2 = 0;
        while (pointer < diffs.length) {
          if (diffs[pointer][0] == DIFF_EQUAL) {
            equalities[equalitiesLength++] = pointer;
            length_insertions1 = length_insertions2;
            length_deletions1 = length_deletions2;
            length_insertions2 = 0;
            length_deletions2 = 0;
            lastequality = diffs[pointer][1];
          } else {
            if (diffs[pointer][0] == DIFF_INSERT) {
              length_insertions2 += diffs[pointer][1].length;
            } else {
              length_deletions2 += diffs[pointer][1].length;
            }
            if (lastequality && lastequality.length <= Math.max(length_insertions1, length_deletions1) && lastequality.length <= Math.max(
              length_insertions2,
              length_deletions2
            )) {
              diffs.splice(
                equalities[equalitiesLength - 1],
                0,
                [DIFF_DELETE, lastequality]
              );
              diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
              equalitiesLength--;
              equalitiesLength--;
              pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
              length_insertions1 = 0;
              length_deletions1 = 0;
              length_insertions2 = 0;
              length_deletions2 = 0;
              lastequality = null;
              changes = true;
            }
          }
          pointer++;
        }
        if (changes) {
          this.cleanupMerge(diffs);
        }
        this.cleanupSemanticLossless(diffs);
        pointer = 1;
        while (pointer < diffs.length) {
          if (diffs[pointer - 1][0] == DIFF_DELETE && diffs[pointer][0] == DIFF_INSERT) {
            var deletion = diffs[pointer - 1][1];
            var insertion = diffs[pointer][1];
            var overlap_length1 = this.commonOverlap_(deletion, insertion);
            var overlap_length2 = this.commonOverlap_(insertion, deletion);
            if (overlap_length1 >= overlap_length2) {
              if (overlap_length1 >= deletion.length / 2 || overlap_length1 >= insertion.length / 2) {
                diffs.splice(
                  pointer,
                  0,
                  [DIFF_EQUAL, insertion.substring(0, overlap_length1)]
                );
                diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlap_length1);
                diffs[pointer + 1][1] = insertion.substring(overlap_length1);
                pointer++;
              }
            } else {
              if (overlap_length2 >= deletion.length / 2 || overlap_length2 >= insertion.length / 2) {
                diffs.splice(
                  pointer,
                  0,
                  [DIFF_EQUAL, deletion.substring(0, overlap_length2)]
                );
                diffs[pointer - 1][0] = DIFF_INSERT;
                diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlap_length2);
                diffs[pointer + 1][0] = DIFF_DELETE;
                diffs[pointer + 1][1] = deletion.substring(overlap_length2);
                pointer++;
              }
            }
            pointer++;
          }
          pointer++;
        }
      };
      diff2.prototype.cleanupSemanticLossless = function(diffs) {
        function diff_cleanupSemanticScore_(one, two) {
          if (!one || !two) {
            return 6;
          }
          var char1 = one.charAt(one.length - 1);
          var char2 = two.charAt(0);
          var nonAlphaNumeric1 = char1.match(diff2.nonAlphaNumericRegex_);
          var nonAlphaNumeric2 = char2.match(diff2.nonAlphaNumericRegex_);
          var whitespace1 = nonAlphaNumeric1 && char1.match(diff2.whitespaceRegex_);
          var whitespace2 = nonAlphaNumeric2 && char2.match(diff2.whitespaceRegex_);
          var lineBreak1 = whitespace1 && char1.match(diff2.linebreakRegex_);
          var lineBreak2 = whitespace2 && char2.match(diff2.linebreakRegex_);
          var blankLine1 = lineBreak1 && one.match(diff2.blanklineEndRegex_);
          var blankLine2 = lineBreak2 && two.match(diff2.blanklineStartRegex_);
          if (blankLine1 || blankLine2) {
            return 5;
          } else if (lineBreak1 || lineBreak2) {
            return 4;
          } else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
            return 3;
          } else if (whitespace1 || whitespace2) {
            return 2;
          } else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
            return 1;
          }
          return 0;
        }
        var pointer = 1;
        while (pointer < diffs.length - 1) {
          if (diffs[pointer - 1][0] == DIFF_EQUAL && diffs[pointer + 1][0] == DIFF_EQUAL) {
            var equality1 = diffs[pointer - 1][1];
            var edit = diffs[pointer][1];
            var equality2 = diffs[pointer + 1][1];
            var commonOffset = this.commonSuffix(equality1, edit);
            if (commonOffset) {
              var commonString = edit.substring(edit.length - commonOffset);
              equality1 = equality1.substring(0, equality1.length - commonOffset);
              edit = commonString + edit.substring(0, edit.length - commonOffset);
              equality2 = commonString + equality2;
            }
            var bestEquality1 = equality1;
            var bestEdit = edit;
            var bestEquality2 = equality2;
            var bestScore = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
            while (edit.charAt(0) === equality2.charAt(0)) {
              equality1 += edit.charAt(0);
              edit = edit.substring(1) + equality2.charAt(0);
              equality2 = equality2.substring(1);
              var score = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
              if (score >= bestScore) {
                bestScore = score;
                bestEquality1 = equality1;
                bestEdit = edit;
                bestEquality2 = equality2;
              }
            }
            if (diffs[pointer - 1][1] != bestEquality1) {
              if (bestEquality1) {
                diffs[pointer - 1][1] = bestEquality1;
              } else {
                diffs.splice(pointer - 1, 1);
                pointer--;
              }
              diffs[pointer][1] = bestEdit;
              if (bestEquality2) {
                diffs[pointer + 1][1] = bestEquality2;
              } else {
                diffs.splice(pointer + 1, 1);
                pointer--;
              }
            }
          }
          pointer++;
        }
      };
      diff2.nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
      diff2.whitespaceRegex_ = /\s/;
      diff2.linebreakRegex_ = /[\r\n]/;
      diff2.blanklineEndRegex_ = /\n\r?\n$/;
      diff2.blanklineStartRegex_ = /^\r?\n\r?\n/;
      diff2.prototype.cleanupEfficiency = function(diffs) {
        var changes = false;
        var equalities = [];
        var equalitiesLength = 0;
        var lastequality = null;
        var pointer = 0;
        var pre_ins = false;
        var pre_del = false;
        var post_ins = false;
        var post_del = false;
        while (pointer < diffs.length) {
          if (diffs[pointer][0] == DIFF_EQUAL) {
            if (diffs[pointer][1].length < this.EditCost && (post_ins || post_del)) {
              equalities[equalitiesLength++] = pointer;
              pre_ins = post_ins;
              pre_del = post_del;
              lastequality = diffs[pointer][1];
            } else {
              equalitiesLength = 0;
              lastequality = null;
            }
            post_ins = post_del = false;
          } else {
            if (diffs[pointer][0] == DIFF_DELETE) {
              post_del = true;
            } else {
              post_ins = true;
            }
            if (lastequality && (pre_ins && pre_del && post_ins && post_del || lastequality.length < this.EditCost / 2 && pre_ins + pre_del + post_ins + post_del == 3)) {
              diffs.splice(
                equalities[equalitiesLength - 1],
                0,
                [DIFF_DELETE, lastequality]
              );
              diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
              equalitiesLength--;
              lastequality = null;
              if (pre_ins && pre_del) {
                post_ins = post_del = true;
                equalitiesLength = 0;
              } else {
                equalitiesLength--;
                pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                post_ins = post_del = false;
              }
              changes = true;
            }
          }
          pointer++;
        }
        if (changes) {
          this.cleanupMerge(diffs);
        }
      };
      diff2.prototype.cleanupMerge = function(diffs) {
        diffs.push([DIFF_EQUAL, ""]);
        var pointer = 0;
        var count_delete = 0;
        var count_insert = 0;
        var text_delete = "";
        var text_insert = "";
        var commonlength;
        while (pointer < diffs.length) {
          switch (diffs[pointer][0]) {
            case DIFF_INSERT:
              count_insert++;
              text_insert += diffs[pointer][1];
              pointer++;
              break;
            case DIFF_DELETE:
              count_delete++;
              text_delete += diffs[pointer][1];
              pointer++;
              break;
            case DIFF_EQUAL:
              if (count_delete + count_insert > 1) {
                if (count_delete !== 0 && count_insert !== 0) {
                  commonlength = this.commonPrefix(text_insert, text_delete);
                  if (commonlength !== 0) {
                    if (pointer - count_delete - count_insert > 0 && diffs[pointer - count_delete - count_insert - 1][0] == DIFF_EQUAL) {
                      diffs[pointer - count_delete - count_insert - 1][1] += text_insert.substring(0, commonlength);
                    } else {
                      diffs.splice(0, 0, [
                        DIFF_EQUAL,
                        text_insert.substring(0, commonlength)
                      ]);
                      pointer++;
                    }
                    text_insert = text_insert.substring(commonlength);
                    text_delete = text_delete.substring(commonlength);
                  }
                  commonlength = this.commonSuffix(text_insert, text_delete);
                  if (commonlength !== 0) {
                    diffs[pointer][1] = text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1];
                    text_insert = text_insert.substring(0, text_insert.length - commonlength);
                    text_delete = text_delete.substring(0, text_delete.length - commonlength);
                  }
                }
                if (count_delete === 0) {
                  diffs.splice(
                    pointer - count_insert,
                    count_delete + count_insert,
                    [DIFF_INSERT, text_insert]
                  );
                } else if (count_insert === 0) {
                  diffs.splice(
                    pointer - count_delete,
                    count_delete + count_insert,
                    [DIFF_DELETE, text_delete]
                  );
                } else {
                  diffs.splice(
                    pointer - count_delete - count_insert,
                    count_delete + count_insert,
                    [DIFF_DELETE, text_delete],
                    [DIFF_INSERT, text_insert]
                  );
                }
                pointer = pointer - count_delete - count_insert + (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
              } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
                diffs[pointer - 1][1] += diffs[pointer][1];
                diffs.splice(pointer, 1);
              } else {
                pointer++;
              }
              count_insert = 0;
              count_delete = 0;
              text_delete = "";
              text_insert = "";
              break;
          }
        }
        if (diffs[diffs.length - 1][1] === "") {
          diffs.pop();
        }
        var changes = false;
        pointer = 1;
        while (pointer < diffs.length - 1) {
          if (diffs[pointer - 1][0] == DIFF_EQUAL && diffs[pointer + 1][0] == DIFF_EQUAL) {
            if (diffs[pointer][1].substring(diffs[pointer][1].length - diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
              diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
              diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
              diffs.splice(pointer - 1, 1);
              changes = true;
            } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) == diffs[pointer + 1][1]) {
              diffs[pointer - 1][1] += diffs[pointer + 1][1];
              diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
              diffs.splice(pointer + 1, 1);
              changes = true;
            }
          }
          pointer++;
        }
        if (changes) {
          this.cleanupMerge(diffs);
        }
      };
      diff2.prototype.xIndex = function(diffs, loc) {
        var chars1 = 0;
        var chars2 = 0;
        var last_chars1 = 0;
        var last_chars2 = 0;
        var x;
        for (x = 0; x < diffs.length; x++) {
          if (diffs[x][0] !== DIFF_INSERT) {
            chars1 += diffs[x][1].length;
          }
          if (diffs[x][0] !== DIFF_DELETE) {
            chars2 += diffs[x][1].length;
          }
          if (chars1 > loc) {
            break;
          }
          last_chars1 = chars1;
          last_chars2 = chars2;
        }
        if (diffs.length != x && diffs[x][0] === DIFF_DELETE) {
          return last_chars2;
        }
        return last_chars2 + (loc - last_chars1);
      };
      diff2.prototype.prettyHtml = function(diffs) {
        var html = [];
        var pattern_amp = /&/g;
        var pattern_lt = /</g;
        var pattern_gt = />/g;
        var pattern_br = /\n/g;
        for (var x = 0; x < diffs.length; x++) {
          var op = diffs[x][0];
          var data = diffs[x][1];
          var text = data.replace(pattern_amp, "&amp;").replace(pattern_lt, "&lt;").replace(pattern_gt, "&gt;").replace(pattern_br, "<br/>");
          switch (op) {
            case DIFF_INSERT:
              html[x] = "<ins>" + text + "</ins>";
              break;
            case DIFF_DELETE:
              html[x] = "<del>" + text + "</del>";
              break;
            case DIFF_EQUAL:
              html[x] = "<span>" + text + "</span>";
              break;
          }
        }
        return html.join("");
      };
      diff2.prototype.text1 = function(diffs) {
        var text = [];
        for (var x = 0; x < diffs.length; x++) {
          if (diffs[x][0] !== DIFF_INSERT) {
            text[x] = diffs[x][1];
          }
        }
        return text.join("");
      };
      diff2.prototype.text2 = function(diffs) {
        var text = [];
        for (var x = 0; x < diffs.length; x++) {
          if (diffs[x][0] !== DIFF_DELETE) {
            text[x] = diffs[x][1];
          }
        }
        return text.join("");
      };
      diff2.prototype.levenshtein = function(diffs) {
        var levenshtein = 0;
        var insertions = 0;
        var deletions = 0;
        for (var x = 0; x < diffs.length; x++) {
          var op = diffs[x][0];
          var data = diffs[x][1];
          switch (op) {
            case DIFF_INSERT:
              insertions += data.length;
              break;
            case DIFF_DELETE:
              deletions += data.length;
              break;
            case DIFF_EQUAL:
              levenshtein += Math.max(insertions, deletions);
              insertions = 0;
              deletions = 0;
              break;
          }
        }
        levenshtein += Math.max(insertions, deletions);
        return levenshtein;
      };
      diff2.prototype.toDelta = function(diffs) {
        var text = [];
        for (var x = 0; x < diffs.length; x++) {
          switch (diffs[x][0]) {
            case DIFF_INSERT:
              text[x] = "+" + encodeURI(diffs[x][1]);
              break;
            case DIFF_DELETE:
              text[x] = "-" + diffs[x][1].length;
              break;
            case DIFF_EQUAL:
              text[x] = "=" + diffs[x][1].length;
              break;
          }
        }
        return text.join("	").replace(/%20/g, " ");
      };
      diff2.prototype.fromDelta = function(text1, delta) {
        var diffs = [];
        var diffsLength = 0;
        var pointer = 0;
        var tokens = delta.split(/\t/g);
        for (var x = 0; x < tokens.length; x++) {
          var param = tokens[x].substring(1);
          switch (tokens[x].charAt(0)) {
            case "+":
              try {
                diffs[diffsLength++] = [DIFF_INSERT, decodeURI(param)];
              } catch (ex) {
                throw new Error("Illegal escape in diff_fromDelta: " + param);
              }
              break;
            case "-":
            // Fall through.
            case "=":
              var n = parseInt(param, 10);
              if (isNaN(n) || n < 0) {
                throw new Error("Invalid number in diff_fromDelta: " + param);
              }
              var text = text1.substring(pointer, pointer += n);
              if (tokens[x].charAt(0) == "=") {
                diffs[diffsLength++] = [DIFF_EQUAL, text];
              } else {
                diffs[diffsLength++] = [DIFF_DELETE, text];
              }
              break;
            default:
              if (tokens[x]) {
                throw new Error("Invalid diff operation in diff_fromDelta: " + tokens[x]);
              }
          }
        }
        if (pointer != text1.length) {
          throw new Error("Delta length (" + pointer + ") does not equal source text length (" + text1.length + ").");
        }
        return diffs;
      };
      exports["diff"] = diff2;
      exports["DIFF_DELETE"] = DIFF_DELETE;
      exports["DIFF_INSERT"] = DIFF_INSERT;
      exports["DIFF_EQUAL"] = DIFF_EQUAL;
      module.exports = diff2;
    }
  });

  // src/index.mjs
  var import_src = __toESM(require_src(), 1);
  var import_text_diff = __toESM(require_diff(), 1);
  var strategy1 = "limit";
  var strategy2 = "fetch";
  var strategy3 = "";
  var limitNumber = 100;
  var limitStrategies = [strategy1, strategy2, strategy3].filter(
    (s) => s !== ""
  );
  var sql = "";
  var diff = new import_text_diff.default();
  var limited = "";
  var textDiff;
  var prettyHtml;
  var error;
  try {
    error = null;
    limited = import_src.default.limit(sql, strategies, limitNumber);
    textDiff = diff.main(sql, limited);
    prettyHtml = diff.prettyHtml(textDiff);
  } catch (e) {
    error = e;
  }
  console.log(limited);
  console.log(textDiff);
  consosle.log(prettyHtml);
})();
