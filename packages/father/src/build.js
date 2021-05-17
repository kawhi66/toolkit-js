import { ModuleFormat, rollup, watch } from "rollup";
import { getExistFile } from "./utils";
import getRollupConfig from "./config/rollup";
import log from "./utils/log";
import signale from "signale";
// import { Dispose, IBundleOptions } from "./types";
// import normalizeBundleOpts from "./normalizeBundleOpts";

export default async function build(opts) {
  const { cwd, rootPath, type, importLibToEs, dispose } = opts;
  const entry = getExistFile({
    cwd,
    files: ["src/index.tsx", "src/index.ts", "src/index.jsx", "src/index.js"],
    returnRelative: true,
  });
  const rollupConfigs = getRollupConfig({
    cwd,
    rootPath: rootPath || cwd,
    type,
    entry,
    importLibToEs,
    // bundleOpts: normalizeBundleOpts(entry, bundleOpts),
  });

  for (const rollupConfig of rollupConfigs) {
    if (opts.watch) {
      const watcher = watch([
        {
          ...rollupConfig,
          watch: {},
        },
      ]);
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
      const bundle = await rollup(input); // eslint-disable-line
      await bundle.write(output); // eslint-disable-line
    }
  }
}

// export default async function (opts) {
//   if (Array.isArray(opts.entry)) {
//     const { entry: entries } = opts;
//     for (const entry of entries) {
//       await build(entry, opts);
//     }
//   } else {
//     await build(opts.entry, opts);
//   }
// }
