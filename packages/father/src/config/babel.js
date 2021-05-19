import { extname } from "path";

export default function (opts) {
  const {
    type,
    babelOpts: {
      target = "browser",
      typescript,
      runtimeHelpers,
      filePath,
      browserFiles = [],
      nodeVersion,
      nodeFiles = [],
      lazy,
      extraBabelPresets = [],
      extraBabelPlugins = [],
    },
  } = opts;
  let isBrowser = target === "browser";
  // rollup 场景下不会传入 filePath
  if (filePath) {
    if (extname(filePath) === ".tsx" || extname(filePath) === ".jsx") {
      isBrowser = true;
    } else {
      if (isBrowser) {
        if (nodeFiles.includes(filePath)) isBrowser = false;
      } else {
        if (browserFiles.includes(filePath)) isBrowser = true;
      }
    }
  }
  const targets = isBrowser ? { browsers: ["last 2 versions", "IE 10"] } : { node: nodeVersion || 6 };

  console.log(type, "------------------------ type -------------------------------");

  return {
    opts: {
      presets: [
        ...(typescript ? [require.resolve("@babel/preset-typescript")] : []),
        [
          require.resolve("@babel/preset-env"),
          {
            targets,
            modules: type === "esm" ? false : "auto",
          },
        ],
        ...extraBabelPresets,
      ],
      plugins: [
        ...(type === "cjs" && lazy && !isBrowser
          ? [[require.resolve("@babel/plugin-transform-modules-commonjs"), { lazy: true }]]
          : []),
        require.resolve("@babel/plugin-syntax-dynamic-import"),
        require.resolve("@babel/plugin-proposal-export-default-from"),
        require.resolve("@babel/plugin-proposal-export-namespace-from"),
        require.resolve("@babel/plugin-proposal-do-expressions"),
        require.resolve("@babel/plugin-proposal-nullish-coalescing-operator"),
        require.resolve("@babel/plugin-proposal-optional-chaining"),
        [require.resolve("@babel/plugin-proposal-decorators"), { legacy: true }],
        [require.resolve("@babel/plugin-proposal-class-properties"), { loose: true }],
        [require.resolve("@babel/plugin-proposal-private-methods"), { loose: true }],
        ...(runtimeHelpers
          ? [
              [
                require.resolve("@babel/plugin-transform-runtime"),
                {
                  useESModules: isBrowser && type === "esm",
                  version: require("@babel/runtime/package.json").version,
                },
              ],
            ]
          : []),
        ...(process.env.COVERAGE ? [require.resolve("babel-plugin-istanbul")] : []),
        ...extraBabelPlugins,
      ],
    },
    isBrowser,
  };
}
