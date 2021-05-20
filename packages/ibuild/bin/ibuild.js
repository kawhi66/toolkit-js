#!/usr/bin/env node

const { existsSync } = require("fs");
const { join } = require("path");
const yParser = require("yargs-parser");
const chalk = require("chalk");
const signale = require("signale");

// print version and @local
const args = yParser(process.argv.slice(2));
if (args.v || args.version) {
  console.log(require("../package").version);
  if (existsSync(join(__dirname, "../.local"))) {
    console.log(chalk.cyan("@local"));
  }
  process.exit(0);
}

// print help
if (args.h || args.help) {
  printHelp();
  process.exit(0);
}

// Notify update when process exits
const updater = require("update-notifier");
const pkg = require("../package.json");
updater({ pkg }).notify({ defer: true });

require("../lib")
  .build({
    transform: args.transform || false,
    // type: args.t || args.type || "cjs",
    watch: args.w || args.watch || false,
  })
  .catch((e) => {
    signale.error(e);
    process.exit(1);
  });

function printHelp() {
  console.log(`
  Usage: ibuild [options]

  Options:

    ${chalk.green("--transform")}         Skip bundle and transform src to lib (default: false)
    ${chalk.green("-t, --type")}          Use specified build type (cjs | esm | umd, default: cjs)
    ${chalk.green("-w, --watch")}         Watch building (default: false)
    ${chalk.green("-h, --help")}          Print help
    ${chalk.green("-v, --version")}       Print version
  `);
}
