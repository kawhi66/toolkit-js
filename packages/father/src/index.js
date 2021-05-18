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
  console.log(opts);
  await transformTask({ ...opts, cwd, dispose });
}
