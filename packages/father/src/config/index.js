import { existsSync, readFileSync } from "fs";
import { join, basename } from "path";
import * as assert from "assert";
import chalk from "chalk";
import signale from "signale";
import { merge } from "lodash";
import { getExistFile } from "../utils";
import getUserConfig from "./user";

// TODO root config file
export function getConfig(opts) {
  const { cwd, rootConfig = {}, args = {} } = opts;
  const entry = getExistFile({
    cwd,
    files: ["src/index.tsx", "src/index.ts", "src/index.jsx", "src/index.js"],
    returnRelative: true,
  });
  const userConfig = getUserConfig({ cwd });
  const userConfigs = Array.isArray(userConfig) ? userConfig : [userConfig];
  return userConfigs.map((userConfig) => {
    return merge({ entry }, rootConfig, userConfig, args);
  });
}

export function validateConfig(opts, { cwd, rootPath }) {
  if (opts.runtimeHelpers) {
    const pkgPath = join(cwd, "package.json");
    assert.ok(
      existsSync(pkgPath),
      `@babel/runtime dependency is required to use runtimeHelpers`
    );
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    assert.ok(
      (pkg.dependencies || {})["@babel/runtime"],
      `@babel/runtime dependency is required to use runtimeHelpers`
    );
  }
  //   if (opts.cjs && opts.cjs.lazy && opts.cjs.type === "rollup") {
  //     throw new Error(
  //       `
  // cjs.lazy don't support rollup.
  //     `.trim()
  //     );
  //   }
  //   if (!opts.esm && !opts.cjs && !opts.umd) {
  //     throw new Error(
  //       `
  // None format of ${chalk.cyan(
  //         "cjs | esm | umd"
  //       )} is configured, checkout https://github.com/umijs/father for usage details.
  // `.trim()
  //     );
  //   }
  if (opts.entry) {
    const tsConfigPath = join(cwd, "tsconfig.json");
    const tsConfig =
      existsSync(tsConfigPath) ||
      (rootPath && existsSync(join(rootPath, "tsconfig.json")));
    if (
      !tsConfig &&
      ((Array.isArray(opts.entry) && opts.entry.some(isTypescriptFile)) ||
        (!Array.isArray(opts.entry) && isTypescriptFile(opts.entry)))
    ) {
      signale.info(
        `Project using ${chalk.cyan(
          "typescript"
        )} but tsconfig.json not exists. Use default config.`
      );
    }
  }
}

function isTypescriptFile(filePath) {
  return filePath.endsWith(".ts") || filePath.endsWith(".tsx");
}
