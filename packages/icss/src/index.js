import { join, extname, relative } from 'path';
import { isUndefined } from 'lodash';
import vfs from 'vinyl-fs';
import through from 'through2';
import gulpIf from 'gulp-if';
import gulpPlumber from 'gulp-plumber';
import gulpLess from 'gulp-less';
import autoprefixer from 'gulp-autoprefixer';
import cssmin from 'gulp-cssmin';
import * as chokidar from 'chokidar';

export default async function (opts) {
  const { cwd = process.cwd(), entry, watch } = opts;
  const srcPath = cwd;
  const targetDir = 'lib';
  const targetPath = join(cwd, targetDir);

  if (isUndefined(entry)) {
    throw new Error('Entry required but got undefined.');
  }

  function createStream() {
    return vfs
      .src(entry, { allowEmpty: true, base: srcPath })
      .pipe(watch ? gulpPlumber() : through.obj())
      .pipe(gulpIf((f) => /\.less$/.test(f.path), gulpLess()))
      .pipe(gulpIf((f) => /\.s[ac]ss$/.test(f.path), resolveGulpSass()()))
      .pipe(
        autoprefixer({
          overrideBrowserslist: ['ie > 9', 'last 2 versions'],
          cascade: false,
        }),
      )
      .pipe(cssmin())
      .pipe(vfs.dest(targetPath));
  }

  return new Promise((resolve) => {
    createStream().on('end', () => {
      resolve();
    });
  });
}

function resolveGulpSass() {
  try {
    const localGulpSassPath = require.resolve('gulp-sass', {
      paths: [process.cwd()],
    });
    return require(localGulpSassPath);
  } catch (error) {
    if (error && error.code === 'MODULE_NOT_FOUND') {
      throw new Error('gulp-sass required but not found.');
    } else {
      throw error;
    }
  }
}
