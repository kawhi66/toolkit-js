import buildTask from "./build";
import transformTask from "./transform";
import { getConfig, validateConfig } from "./config";

/**
 * TODO
 *  - dispose
 *  - validateConfig
 *  - lerna
 */

const cwd = process.cwd();

const dispose = [];

export async function build(args) {
  let opts = getConfig({ cwd });
  // validateConfig(opts, { cwd });

  opts = { ...opts, cwd, dispose, ...args };

  if (opts.transform) {
    await transformTask(opts);
  }

  if (opts.type) {
    await buildTask(opts);
  }
}
