import { existsSync, readFileSync } from "fs";
import { join, basename, relative } from "path";
import { merge } from "lodash";
import { getExistFile } from "../utils";
import * as assert from "assert";
import AJV from "ajv";
import chalk from "chalk";
import getBabelConfig from "./babel";
import schema from "./schema";
import signale from "signale";
import slash from "slash2";

function isTypescriptFile(filePath) {
  return filePath.endsWith(".ts") || filePath.endsWith(".tsx");
}

function testDefault(obj) {
  return obj.default || obj;
}

function registerBabel(cwd, only) {
  const { opts: babelConfig } = getBabelConfig({
    babelOpts: {
      target: "node",
      typescript: true,
    },
  });
  require("@babel/register")({
    ...babelConfig,
    extensions: [".es6", ".es", ".jsx", ".js", ".mjs", ".ts", ".tsx"],
    only: only.map((file) => slash(join(cwd, file))),
    babelrc: false,
    cache: false,
  });
}

export const CONFIG_FILES = [".fatherrc.js", ".fatherrc.jsx", ".fatherrc.ts", ".fatherrc.tsx"];

// TODO
const CLASSES = { Function: Function };
const extendAjv = (ajv) => {
  ajv.addKeyword("instanceof", {
    compile: function (schema) {
      var Class = CLASSES[schema];
      return function (data) {
        return data instanceof Class;
      };
    },
  });
  return ajv;
};

function getUserConfig({ cwd }) {
  const configFile = getExistFile({
    cwd,
    files: CONFIG_FILES,
    returnRelative: false,
  });

  if (configFile) {
    // register babel for config files
    registerBabel(cwd, CONFIG_FILES);

    const userConfig = testDefault(require(configFile)); // eslint-disable-line
    const userConfigs = Array.isArray(userConfig) ? userConfig : [userConfig];
    userConfigs.forEach((userConfig) => {
      const ajv = extendAjv(new AJV({ allErrors: true }));
      const isValid = ajv.validate(schema, userConfig);
      if (!isValid) {
        const errors = ajv.errors.map(({ dataPath, message }, index) => {
          return `${index + 1}. ${dataPath}${dataPath ? " " : ""}${message}`;
        });
        throw new Error(
          `
Invalid options in ${slash(relative(cwd, configFile))}

${errors.join("\n")}
`.trim()
        );
      }
    });
    return userConfig;
  } else {
    return {};
  }
}

// TODO root config file
// TODO babelOpts
// TODO rollupOpts
export function getConfig(opts) {
  const { cwd, rootConfig = {}, args = {} } = opts;
  const defaultEntry = getExistFile({
    cwd,
    files: ["src/index.tsx", "src/index.ts", "src/index.jsx", "src/index.js"],
    returnRelative: true,
  });
  const userConfig = getUserConfig({ cwd });
  const userConfigs = Array.isArray(userConfig) ? userConfig : [userConfig];
  return userConfigs.map((userConfig) => {
    const { isTransforming, watch, entry, file, type, runtimeHelpers, target, disableTypeCheck } = merge(
      { entry: defaultEntry },
      rootConfig,
      userConfig,
      args
    );
    return {
      isTransforming,
      watch,
      type,
      disableTypeCheck,
      babelOpts: { runtimeHelpers, target },
      rollupOpts: { entry, file },
    };
  });
}

// TODO isTransforming - transform or build
export function validateConfig(opts, { cwd, rootPath }) {
  if (opts.babelOpts.runtimeHelpers) {
    const pkgPath = join(cwd, "package.json");
    assert(existsSync(pkgPath), `@babel/runtime dependency is required to use runtimeHelpers`);
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    assert((pkg.dependencies || {})["@babel/runtime"], `@babel/runtime dependency is required to use runtimeHelpers`);
  }

  // umd is only for build task
  if (opts.isTransforming && opts.type === "umd") {
    assert.fail(`umd is only for build`);
  }

  if (opts.rollupOpts.entry) {
    const tsConfigPath = join(cwd, "tsconfig.json");
    const tsConfig = existsSync(tsConfigPath) || (rootPath && existsSync(join(rootPath, "tsconfig.json")));
    if (
      !tsConfig &&
      ((Array.isArray(opts.rollupOpts.entry) && opts.rollupOpts.entry.some(isTypescriptFile)) ||
        (!Array.isArray(opts.rollupOpts.entry) && isTypescriptFile(opts.rollupOpts.entry)))
    ) {
      signale.info(`Project using ${chalk.cyan("typescript")} but tsconfig.json not exists. Use default config.`);
    }
  }
}
