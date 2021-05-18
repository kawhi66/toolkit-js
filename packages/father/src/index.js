import transformTask from "./transform";
import buildTask from "./build";
import { getConfig, validateConfig } from "./config";

// export { transform, build };

/**
 * TODO
 *  - rootPath
 *  - dispose
 *  - importLibToEs
 */

const cwd = process.cwd();

const dispose = [];

export async function transform(args) {
  const [opts] = getConfig({ cwd, args });
  validateConfig(opts, { cwd });
  await transformTask({ ...opts, cwd, dispose });
}

export async function build(args) {
  const optsArray = getConfig({ cwd, args });
  for (const opts of optsArray) {
    validateConfig(opts, { cwd });
    await buildTask({ ...opts, cwd, dispose });
  }
}
