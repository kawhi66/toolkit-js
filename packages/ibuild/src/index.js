import { existsSync } from "fs";
import { join } from "path";
import { getPackages } from "@lerna/project";
import { getConfig, validateConfig } from "./config";
import * as assert from "assert";
import buildTask from "./build";
import transformTask from "./transform";

/**
 * TODO
 *  - validateConfig
 */

const dispose = [];

export async function build(opts) {
  const cwd = opts.cwd || process.cwd();
  let userConfig = getConfig({ cwd });
  // validateConfig(userConfig, { cwd });

  userConfig = { ...userConfig, ...opts, cwd, dispose };

  if (userConfig.transform) {
    await transformTask(userConfig);
  }

  if (userConfig.type) {
    await buildTask(userConfig);
  }
}

export default async function (args) {
  const cwd = process.cwd();
  const isLerna = existsSync(join(cwd, "lerna.json"));

  if (isLerna) {
    let pkgs = await getPackages(cwd);

    // support define pkgs in lerna
    // TODO: 使用lerna包解决依赖编译问题
    // if (userConfig.pkgs) {
    //   pkgs = userConfig.pkgs
    //     .map((item) => {
    //       return pkgs.find((pkg) => basename(pkg.contents) === item);
    //     })
    //     .filter(Boolean);
    // }

    for (const pkg of pkgs) {
      // build error when .DS_Store includes in packages root
      const pkgPath = pkg.contents;
      assert.ok(existsSync(join(pkgPath, "package.json")), `package.json not found in packages/${pkg}`);
      process.chdir(pkgPath);
      await build({ ...args, cwd: pkgPath, rootPath: cwd });
    }
  } else {
    await build({ ...args, cwd });
  }

  return () => dispose.forEach((e) => e());
}
