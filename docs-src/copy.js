const path = require("path");
const rimraf = require("rimraf");
const ncp = require("ncp");
const mkdirp = require("mkdirp");

const source = path.join(__dirname, "public");
const dest = path.join(__dirname, "../docs");

function handleErr(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
}

mkdirp(dest).then(() => {
  rimraf(dest, (err) => {
    handleErr(err);
    ncp(source, dest, handleErr);
  });
});
