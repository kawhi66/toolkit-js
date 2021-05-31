import { join } from 'path';
import { rollup, watch as rollupWatch } from 'rollup';
import getRollupConfig from './config/rollup';
import chalk from 'chalk';
import log from './utils/log';
import rimraf from 'rimraf';
import signale from 'signale';
import { isArray } from 'lodash';

export default async function (opts) {
  const { cwd, rootPath, type, watch, dispose, disableTypeCheck, babelOpts, rollupOpts } = opts;
  const buildTypes = isArray(type) ? type : [type];

  for (const buildType of buildTypes) {
    const rollupConfigs = getRollupConfig({
      cwd,
      rootPath: rootPath || cwd,
      type: buildType,
      disableTypeCheck,
      babelOpts,
      rollupOpts,
    });

    for (const rollupConfig of rollupConfigs) {
      // Clean dist file
      log(chalk.gray(`Clean file ${rollupConfig?.output?.file}`));
      rimraf.sync(rollupConfig?.output?.file);

      if (watch) {
        const watcher = rollupWatch([{ ...rollupConfig, watch: {} }]);
        watcher.on('event', (event) => {
          if (event.error) {
            signale.error(event.error);
          } else if (event.code === 'START') {
            log(`[${buildType}] Rebuild since file changed`);
          }
        });
        process.once('SIGINT', () => {
          watcher.close();
        });
        dispose?.push(() => watcher.close());
      } else {
        const { output, ...input } = rollupConfig;
        const bundle = await rollup(input);
        await bundle.write(output);
      }
    }
  }
}
