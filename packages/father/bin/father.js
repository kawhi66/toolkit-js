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

// Notify update when process exits
const updater = require("update-notifier");
const pkg = require("../package.json");
updater({ pkg }).notify({ defer: true });

// function stripEmptyKeys(obj) {
//   Object.keys(obj).forEach((key) => {
//     if (!obj[key] || (Array.isArray(obj[key]) && !obj[key].length)) {
//       delete obj[key];
//     }
//   });
//   return obj;
// }

const cmd = args._[0];
const argsConfig = {
  transform: args.transform || false,
  type: args.t || args.type || "cjs",
  watch: args.w || args.watch || false,
};

switch (cmd) {
  case "build":
    require("../lib")
      .build({
        ...argsConfig,
        isTransforming: args.transform || false,
      })
      .catch((e) => {
        signale.error(e);
        process.exit(1);
      });
    break;

  case "help":
  case undefined:
    printHelp();
    break;

  default:
    console.error(chalk.red(`Unsupported command ${cmd}`));
    process.exit(1);
}

/**
 * father build --transform - 把 src 目录转化成 lib（cjs） 或 es（esm）
 * father build - 跟进 entry 把项目依赖打包在一起输出一个文件
 */
function printHelp() {
  console.log(`
  Usage: father <command> [options]

  Commands:

    ${chalk.green("build")}         running build task

  Options:

    ${chalk.green("--transform")}         running transform task
    ${chalk.green("--type")}              build type
    ${chalk.green("--watch")}             watch building
  `);
}
