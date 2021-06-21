#!/usr/bin/env node

const { existsSync } = require('fs');
const { join } = require('path');
const yParser = require('yargs-parser');
const chalk = require('chalk');
const signale = require('signale');

// print version and @local
const args = yParser(process.argv.slice(2));
if (args.v || args.version) {
  console.log(require('../package').version);
  if (existsSync(join(__dirname, '../.local'))) {
    console.log(chalk.cyan('@local'));
  }
  process.exit(0);
}

// print help
if (args.h || args.help) {
  printHelp();
  process.exit(0);
}

// Notify update when process exits
const updater = require('update-notifier');
const pkg = require('../package.json');
updater({ pkg }).notify({ defer: true });

require('../lib')
  .default({
    watch: args.w || args.watch || false,
    entry: args._,
    dest: args.d || args.dest || 'dist',
    rootSelector: args.rootSelector,
  })
  .catch((e) => {
    signale.error(e);
    process.exit(1);
  });

function printHelp() {
  console.log(`
  Usage: icss [options] <entry>

  Options:

    ${chalk.green('-d, --dest <dir>')}              Output directory (default: dist)
    ${chalk.green('-w, --watch')}                   Watch building (default: false)
    ${chalk.green('--root-selector <selector>')}    Wrap root selector (default: '')
    ${chalk.green('-h, --help')}                    Print help
    ${chalk.green('-v, --version')}                 Print version
  `);
}
