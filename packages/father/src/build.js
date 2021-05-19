import { ModuleFormat, rollup, watch as rollupWatch } from "rollup";
import getRollupConfig from "./config/rollup";
import log from "./utils/log";
import signale from "signale";
// import { Dispose, IBundleOptions } from "./types";

export default async function (opts) {
  const { cwd, rootPath, type, watch, dispose, disableTypeCheck, babelOpts, rollupOpts } = opts;
  const rollupConfigs = getRollupConfig({
    cwd,
    rootPath: rootPath || cwd,
    type,
    disableTypeCheck,
    babelOpts,
    rollupOpts,
  });

  for (const rollupConfig of rollupConfigs) {
    if (watch) {
      const watcher = rollupWatch([{ ...rollupConfig, watch: {} }]);
      watcher.on("event", (event) => {
        if (event.error) {
          signale.error(event.error);
        } else if (event.code === "START") {
          log(`[${type}] Rebuild since file changed`);
        }
      });
      process.once("SIGINT", () => {
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
