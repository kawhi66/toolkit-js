import transformTask from "./transform";
import buildTask from "./build";
import { getConfig, validateConfig } from "./config";

/**
 * TODO
 *  - rootPath
 *  - dispose
 */

const cwd = process.cwd();

const dispose = [];

export async function build(args) {
  const optsArray = getConfig({ cwd, args });

  if (args.transform) {
    validateConfig(optsArray[0], { cwd });
    await transformTask({ ...optsArray[0], cwd, dispose });
  } else {
    for (const opts of optsArray) {
      validateConfig(opts, { cwd });
      await buildTask({ ...opts, cwd, dispose });
    }
  }
}
