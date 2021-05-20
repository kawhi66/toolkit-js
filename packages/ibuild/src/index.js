import transformTask from "./transform";
import buildTask from "./build";
import { getConfig, validateConfig } from "./config";

/**
 * TODO
 *  - dispose
 *  - ibuild
 *  - type: string | string[]
 *  - lerna
 */

const cwd = process.cwd();

const dispose = [];

export async function build(args) {
  const opts = getConfig({ cwd, args });
  validateConfig(opts, { cwd });

  if (opts.transform) {
    await transformTask({ ...optsArray[0], cwd, dispose });
  } else {
    await buildTask({ ...opts, cwd, dispose });
  }
}
