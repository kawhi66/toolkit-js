import { join } from 'path';
import { existsSync, statSync } from 'fs';
import { isUndefined, debounce } from 'lodash';
import log from './utils/log';
import vfs from 'vinyl-fs';
import through from 'through2';
import slash from 'slash2';
import gulpIf from 'gulp-if';
import gulpPlumber from 'gulp-plumber';
import gulpLess from 'gulp-less';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import cssmin from 'gulp-cssmin';
import chalk from 'chalk';
import * as chokidar from 'chokidar';

/**
 * @todo watch crashed when glob
 *
 * @feature
 *  - support less scss
 *
 * @tutorial
 *  - bundle css - icss src/style/main.css
 *  - build css - icss src/style/*.css
 *  - copy file - icss src/style/fonts/**
 */

const dispose = [];

export default async function (opts) {
  const { cwd = process.cwd(), entry, dest, watch } = opts;
  const targetDir = dest;
  const targetPath = join(cwd, targetDir);

  if (isUndefined(entry)) {
    throw new Error('Entry required but got undefined.');
  }

  function createStream(patterns) {
    return vfs
      .src(patterns)
      .pipe(watch ? gulpPlumber() : through.obj())
      .pipe(gulpIf((f) => /\.less$/.test(f.path), gulpLess()))
      .pipe(gulpIf((f) => /\.s[ac]ss$/.test(f.path), gulpSass()))
      .pipe(
        gulpIf(
          (f) => /\.(css|less|s[ac]ss)$/.test(f.path),
          autoprefixer({
            overrideBrowserslist: ['ie > 9', 'last 2 versions'],
            cascade: false,
          }),
        ),
      )
      .pipe(gulpIf((f) => /\.(css|less|s[ac]ss)$/.test(f.path), cssmin()))
      .pipe(vfs.dest(targetPath));
  }

  return new Promise((resolve) => {
    const patterns = entry.map((item) => slash(item));
    createStream(patterns).on('end', () => {
      if (watch) {
        log(chalk.magenta(`Start watching ${patterns}`));
        const watcher = chokidar.watch(patterns, {
          ignoreInitial: true,
        });

        const files = [];
        function compileFiles() {
          while (files.length) {
            createStream(files.pop());
          }
        }

        const debouncedCompileFiles = debounce(compileFiles, 1000);
        watcher.on('all', (event, fullPath) => {
          log(`[${event}] ${slash(fullPath)}`);
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

// function resolveGulpSass() {
//   try {
//     const localGulpSassPath = require.resolve('gulp-sass', {
//       paths: [process.cwd()],
//     });
//     return require(localGulpSassPath);
//   } catch (error) {
//     if (error && error.code === 'MODULE_NOT_FOUND') {
//       throw new Error('gulp-sass required but not found.');
//     } else {
//       throw error;
//     }
//   }
// }
