import { existsSync, readFileSync } from 'fs';
import { join, relative } from 'path';
import { isArray, merge } from 'lodash';
import { getExistFile } from '../utils';
import * as assert from 'assert';
import AJV from 'ajv';
import chalk from 'chalk';
import getBabelConfig from './babel';
import schema from './schema';
import signale from 'signale';
import slash from 'slash2';

function isTypescriptFile(filePath) {
  return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
}

function testDefault(obj) {
  return obj.default || obj;
}

// automatically compile files on the fly
function registerBabel(cwd, only) {
  const { opts: babelConfig } = getBabelConfig({
    babelOpts: {
      target: 'node',
      typescript: true,
    },
  });
  require('@babel/register')({
    ...babelConfig,
    extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
    only: only.map((file) => slash(join(cwd, file))),
    babelrc: false,
    cache: false,
  });
}

export const CONFIG_FILES = ['.ibuildrc.js', '.ibuildrc.jsx', '.ibuildrc.ts', '.ibuildrc.tsx'];

// TODO
const CLASSES = { Function: Function };
const extendAjv = (ajv) => {
  ajv.addKeyword('instanceof', {
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
    registerBabel(cwd, CONFIG_FILES);

    const userConfig = testDefault(require(configFile));
    const userConfigs = isArray(userConfig) ? userConfig : [userConfig];
    userConfigs.forEach((userConfig) => {
      const ajv = extendAjv(new AJV({ allErrors: true }));
      const isValid = ajv.validate(schema, userConfig);
      if (!isValid) {
        const errors = ajv.errors.map(({ dataPath, message }, index) => {
          return `${index + 1}. ${dataPath}${dataPath ? ' ' : ''}${message}`;
        });
        throw new Error(
          `
Invalid options in ${slash(relative(cwd, configFile))}

${errors.join('\n')}
`.trim(),
        );
      }
    });
    return userConfig;
  } else {
    return {};
  }
}

export function getConfig(opts) {
  const { cwd, rootConfig = {} } = opts;
  const defaultEntry = getExistFile({
    cwd,
    files: ['src/index.tsx', 'src/index.ts', 'src/index.jsx', 'src/index.js'],
    returnRelative: true,
  });
  const userConfig = getUserConfig({ cwd });
  const userConfigs = isArray(userConfig) ? userConfig : [userConfig];
  return userConfigs.map((userConfig) => {
    const {
      watch,
      entry,
      file,
      type,
      transform,
      transformType,
      disableTypeCheck,
      target = 'browser',
      runtimeHelpers,
      browserFiles = [],
      nodeVersion,
      nodeFiles = [],
      lazy,
      babelExclude = /\/node_modules\//,
      extraBabelPresets = [],
      extraBabelPlugins = [],
      extractCSS = false,
      injectCSS = true,
      cssModules,
      extraPostCSSPlugins = [],
      extraRollupPlugins = [],
      autoprefixer,
      replace,
      inject,
      extraExternals = [],
      externalsExclude = [],
      typescriptOpts,
      nodeResolveOpts = {},
      minify = false,
      umd,
    } = merge({ entry: defaultEntry }, rootConfig, userConfig);
    return {
      watch,
      type,
      transform,
      transformType,
      disableTypeCheck,
      babelOpts: {
        target,
        runtimeHelpers,
        browserFiles,
        nodeVersion,
        nodeFiles,
        lazy,
        babelExclude,
        extraBabelPresets,
        extraBabelPlugins,
      },
      rollupOpts: {
        entry,
        file,
        extractCSS,
        injectCSS,
        cssModules,
        extraPostCSSPlugins,
        extraRollupPlugins,
        autoprefixer,
        replace,
        inject,
        extraExternals,
        externalsExclude,
        typescriptOpts,
        nodeResolveOpts,
        minify,
        umd,
      },
    };
  });
}

export function validateConfig(opts, { cwd, rootPath }) {
  if (opts.babelOpts.runtimeHelpers) {
    const pkgPath = join(cwd, 'package.json');
    assert.ok(existsSync(pkgPath), `@babel/runtime dependency is required to use runtimeHelpers`);
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    assert.ok(
      (pkg.dependencies || {})['@babel/runtime'],
      `@babel/runtime dependency is required to use runtimeHelpers`,
    );
  }

  if (opts.babelOpts.lazy) {
    signale.info(`Option lazy is only working for cjs transform task.`);
  }

  if (
    opts.transform &&
    !opts.transformType &&
    (opts.type === 'umd' || opts.type?.includes('umd'))
  ) {
    throw new Error('Format umd is only working for build task.');
  }

  if (opts.rollupOpts.entry) {
    const tsConfigPath = join(cwd, 'tsconfig.json');
    const tsConfig =
      existsSync(tsConfigPath) || (rootPath && existsSync(join(rootPath, 'tsconfig.json')));
    if (!tsConfig && isTypescriptFile(opts.rollupOpts.entry)) {
      signale.info(
        `Project using ${chalk.cyan(
          'typescript',
        )} but tsconfig.json not exists. Use default config.`,
      );
    }
  }
}
