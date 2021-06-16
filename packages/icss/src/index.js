import { join, extname, relative } from 'path';
import vfs from 'vinyl-fs';
import through from 'through2';
import gulpIf from 'gulp-if';
import gulpPlumber from 'gulp-plumber';
import gulpLess from 'gulp-less';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import cssmin from 'gulp-cssmin';
import * as chokidar from 'chokidar';

export default async function (opts) {
  const { cwd = process.cwd(), watch } = opts;
  const entry = './element-ui/theme-chalk/src/*.scss';
  const srcPath = cwd;
  const targetDir = 'lib';
  const targetPath = join(cwd, targetDir);

  function createStream() {
    return vfs
      .src(entry, { allowEmpty: true, base: srcPath })
      .pipe(watch ? gulpPlumber() : through.obj())
      .pipe(gulpIf((f) => /\.less$/.test(f.path), gulpLess()))
      .pipe(gulpIf((f) => /\.s[ac]ss$/.test(f.path), gulpSass()))
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
