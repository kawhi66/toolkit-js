#!/usr/bin/env node

console.log("@toolkit-js/father 123");

/**
 * father transform - 把 src 目录转化成 lib（cjs） 或 es（esm）
 * father build - 跟进 entry 把项目依赖打包在一起输出一个文件
 */

const { existsSync } = require("fs");
const { join } = require("path");
const yParser = require("yargs-parser");
const chalk = require("chalk");
const signale = require("signale");
const { transform, build } = require("../lib");

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
switch (cmd) {
  case "transform":
    transform({
      cwd: process.cwd(),
      watch: args.w || args.watch,
      // compile options
      target: "node",
    }).catch((e) => {
      signale.error(e);
      process.exit(1);
    });
    break;
  case "build":
    build({
      cwd: process.cwd(),
      watch: args.w || args.watch,
      // compile options
      target: "node",
      type: "umd",
    }).catch((e) => {
      signale.error(e);
      process.exit(1);
    });
    break;
  default:
    console.error(chalk.red(`Unsupported command ${cmd}`));
    process.exit(1);
}
