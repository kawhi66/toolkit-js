#!/usr/bin/env node

/**
 * father transform - 把 src 目录转化成 lib（cjs） 或 es（esm）
 * father build - 跟进 entry 把项目依赖打包在一起输出一个文件
 */

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
  watch: args.w || args.watch || false,
  type: args.t || args.type || "cjs",
};
switch (cmd) {
  case "transform":
    require("../lib")
      .transform({
        ...argsConfig,
        isTransforming: true,
      })
      .catch((e) => {
        signale.error(e);
        process.exit(1);
      });
    break;
  case "build":
    require("../lib")
      .build({
        ...argsConfig,
        isTransforming: false,
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

// TODO
function printHelp() {
  console.log(`
  Usage: father <command> [options]

  Commands:

    ${chalk.green("build")}         running build task
    ${chalk.green("transform")}     running transform task
  `);
}
