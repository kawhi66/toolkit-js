import { join, extname, relative } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';
import vfs from 'vinyl-fs';
import signale from 'signale';
import lodash from 'lodash';
import log from './utils/log';
import rimraf from 'rimraf';
import through from 'through2';
import slash from 'slash2';
import * as chokidar from 'chokidar';
import * as babel from '@babel/core';
import gulpTs from 'gulp-typescript';
import gulpLess from 'gulp-less';
import gulpPlumber from 'gulp-plumber';
import gulpIf from 'gulp-if';
import chalk from 'chalk';
import getBabelConfig from './config/babel';
import * as ts from 'typescript';

export default async function (opts) {
  const {
    cwd,
    rootPath,
    type: buildType,
    transformType,
    watch,
    dispose,
    disableTypeCheck,
    babelOpts,
  } = opts;
  const srcPath = join(cwd, 'src');
  const targetDir = 'lib';
  const targetPath = join(cwd, targetDir);
  const type = transformType || (lodash.isArray(buildType) ? 'cjs' : buildType);

  log(chalk.gray(`Clean ${targetDir} directory`));
  rimraf.sync(targetPath);

  function transform(opts) {
    const { file, type } = opts;
    const { opts: babelConfig, isBrowser } = getBabelConfig({
      transform: true,
      type,
      babelOpts: {
        ...babelOpts,
        filePath: slash(relative(cwd, file.path)),
        typescript: true,
      },
    });

    const relFile = slash(file.path).replace(`${cwd}/`, '');
    log(`Transform to ${type} for ${chalk[isBrowser ? 'yellow' : 'blue'](relFile)}`);

    return babel.transform(file.contents, {
      ...babelConfig,
      filename: file.path,
      // 不读取外部的babel.config.js配置文件，全采用babelConfig中的babel配置来构建
      configFile: false,
    }).code;
  }

  /**
   * tsconfig.json is not valid json file
   * https://github.com/Microsoft/TypeScript/issues/20384
   */
  function parseTsconfig(path) {
    const readFile = (path) => readFileSync(path, 'utf-8');
    const result = ts.readConfigFile(path, readFile);
    if (result.error) {
      return;
    }
    return result.config;
  }

  function getTsconfigCompilerOptions(path) {
    const config = parseTsconfig(path);
    return config ? config.compilerOptions : undefined;
  }

  function getTSConfig() {
    const tsconfigPath = join(cwd, 'tsconfig.json');
    const templateTsconfigPath = join(__dirname, '../template/tsconfig.json');

    if (existsSync(tsconfigPath)) {
      return getTsconfigCompilerOptions(tsconfigPath) || {};
    }
    if (rootPath && existsSync(join(rootPath, 'tsconfig.json'))) {
      return getTsconfigCompilerOptions(join(rootPath, 'tsconfig.json')) || {};
    }
    return getTsconfigCompilerOptions(templateTsconfigPath) || {};
  }

  function createStream(src) {
    const tsConfig = getTSConfig();
    const babelTransformRegexp = disableTypeCheck ? /\.(t|j)sx?$/ : /\.jsx?$/;

    function isTsFile(path) {
      return /\.tsx?$/.test(path) && !path.endsWith('.d.ts');
    }

    function isTransform(path) {
      return babelTransformRegexp.test(path) && !path.endsWith('.d.ts');
    }

    return vfs
      .src(src, { allowEmpty: true, base: srcPath, dot: true })
      .pipe(watch ? gulpPlumber() : through.obj())
      .pipe(gulpIf((f) => !disableTypeCheck && isTsFile(f.path), gulpTs(tsConfig)))
      .pipe(
        gulpIf(
          (f) => isTransform(f.path),
          through.obj((file, env, cb) => {
            try {
              file.contents = Buffer.from(transform({ file, type }));
              // .jsx -> .js
              file.path = file.path.replace(extname(file.path), '.js');
              cb(null, file);
            } catch (e) {
              signale.error(`Compiled faild: ${file.path}`);
              console.log(e);
              cb(null);
            }
          }),
        ),
      )
      .pipe(vfs.dest(targetPath));
  }

  return new Promise((resolve) => {
    // TODO
    const patterns = [
      join(srcPath, '**/*'),
      `!${join(srcPath, '**/fixtures{,/**}')}`,
      `!${join(srcPath, '**/demos{,/**}')}`,
      `!${join(srcPath, '**/__test__{,/**}')}`,
      `!${join(srcPath, '**/__tests__{,/**}')}`,
      `!${join(srcPath, '**/*.mdx')}`,
      `!${join(srcPath, '**/*.md')}`,
      `!${join(srcPath, '**/*.+(test|e2e|spec).+(js|jsx|ts|tsx)')}`,
    ];
    createStream(patterns).on('end', () => {
      if (watch) {
        log(chalk.magenta(`Start watching ${slash(srcPath).replace(`${cwd}/`, '')} directory...`));
        const watcher = chokidar.watch(patterns, {
          ignoreInitial: true,
        });

        const files = [];
        function compileFiles() {
          while (files.length) {
            createStream(files.pop());
          }
        }

        const debouncedCompileFiles = lodash.debounce(compileFiles, 1000);
        watcher.on('all', (event, fullPath) => {
          const relPath = fullPath.replace(srcPath, '');
          log(`[${event}] ${slash(join(srcPath, relPath)).replace(`${cwd}/`, '')}`);
          if (!existsSync(fullPath)) return;
          if (statSync(fullPath).isFile()) {
            if (!files.includes(fullPath)) files.push(fullPath);
            debouncedCompileFiles();
          }
        });
        process.once('SIGINT', () => {
          watcher.close();
        });
        dispose?.push(() => watcher.close());
      }
      resolve();
    });
  });
}
