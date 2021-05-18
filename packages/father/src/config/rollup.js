import { existsSync } from "fs";
import { basename, extname, join } from "path";
import { ModuleFormat, RollupOptions } from "rollup";
import url from "@rollup/plugin-url";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import inject, { RollupInjectOptions } from "@rollup/plugin-inject";
import babel, { RollupBabelInputPluginOptions } from "@rollup/plugin-babel";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import typescript2 from "rollup-plugin-typescript2";
import { camelCase } from "lodash";
import tempDir from "temp-dir";
import autoprefixer from "autoprefixer";
import NpmImport from "less-plugin-npm-import";
import svgr from "@svgr/rollup";
import getBabelConfig from "./babel";
// import { IBundleOptions } from "./types";

export default function (opts) {
  const {
    cwd,
    rootPath,
    type,
    disableTypeCheck,
    babelOpts,
    rollupOpts: {
      entry,
      file,
      target = "browser",
      runtimeHelpers: runtimeHelpersOpts,
      extractCSS = false,
      injectCSS = true,
      cssModules: modules,
      extraPostCSSPlugins = [],
      extraRollupPlugins = [],
      autoprefixer: autoprefixerOpts,
      include = /node_modules/,
      replace: replaceOpts,
      inject: injectOpts,
      extraExternals = [],
      externalsExclude = [],
      typescriptOpts,
      nodeResolveOpts = {},
      lessInRollupMode = {},
      sassInRollupMode = {},
    },
  } = opts;

  // TODO
  const { umd, esm, cjs } = opts;

  const entryExt = extname(entry);
  const name = file || basename(entry, entryExt);
  const isTypeScript = entryExt === ".ts" || entryExt === ".tsx";
  const extensions = [".js", ".jsx", ".ts", ".tsx", ".es6", ".es", ".mjs"];

  let pkg = {};
  try {
    pkg = require(join(cwd, "package.json"));
  } catch (e) {}

  // cjs 不给浏览器用，所以无需 runtimeHelpers
  const runtimeHelpers = type === "cjs" ? false : runtimeHelpersOpts;
  const babelConfig = {
    ...getBabelConfig({
      type,
      babelOpts: {
        ...babelOpts,
        target: type === "esm" ? "browser" : target,
        // watch 模式下有几率走的 babel？原因未知。
        // ref: https://github.com/umijs/father/issues/158
        typescript: true,
      },
    }).opts,
    // ref: https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
    babelHelpers: runtimeHelpers ? "runtime" : "bundled",
    exclude: /\/node_modules\//,
    babelrc: false,
    // ref: https://github.com/rollup/rollup-plugin-babel#usage
    extensions,
  };

  // rollup configs
  const input = join(cwd, entry);
  const format = type;

  // ref: https://rollupjs.org/guide/en#external
  // 潜在问题：引用包的子文件时会报 warning，比如 @babel/runtime/helpers/esm/createClass
  // 解决方案：可以用 function 处理
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...extraExternals,
  ];
  // umd 只要 external peerDependencies
  const externalPeerDeps = [...Object.keys(pkg.peerDependencies || {}), ...extraExternals];

  function getPkgNameByid(id) {
    const splitted = id.split("/");
    // @ 和 @tmp 是为了兼容 umi 的逻辑
    if (id.charAt(0) === "@" && splitted[0] !== "@" && splitted[0] !== "@tmp") {
      return splitted.slice(0, 2).join("/");
    } else {
      return id.split("/")[0];
    }
  }

  function testExternal(pkgs, excludes, id) {
    if (excludes.includes(id)) {
      return false;
    }
    return pkgs.includes(getPkgNameByid(id));
  }

  const terserOpts = {
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false,
    },
  };

  function getPlugins(opts = {}) {
    const { minCSS } = opts;
    return [
      url(),
      svgr(),
      postcss({
        extract: extractCSS,
        inject: injectCSS,
        modules,
        // modules => all .less will convert into css modules
        ...(modules ? { autoModules: false } : {}),
        minimize: !!minCSS,
        use: {
          less: {
            plugins: [new NpmImport({ prefix: "~" })],
            javascriptEnabled: true,
            ...lessInRollupMode,
          },
          sass: {
            ...sassInRollupMode,
          },
          stylus: false,
        },
        plugins: [
          autoprefixer({
            // https://github.com/postcss/autoprefixer/issues/776
            remove: false,
            ...autoprefixerOpts,
          }),
          ...extraPostCSSPlugins,
        ],
      }),
      ...(injectOpts ? [inject(injectOpts)] : []),
      ...(replaceOpts && Object.keys(replaceOpts || {}).length ? [replace(replaceOpts)] : []),
      nodeResolve({
        mainFields: ["module", "jsnext:main", "main"],
        extensions,
        ...nodeResolveOpts,
      }),
      ...(isTypeScript
        ? [
            typescript2({
              cwd,
              // @see https://github.com/umijs/father/issues/61#issuecomment-544822774
              clean: true,
              cacheRoot: `${tempDir}/.rollup_plugin_typescript2_cache`,
              // 支持往上找 tsconfig.json
              // 比如 lerna 的场景不需要每个 package 有个 tsconfig.json
              tsconfig: [join(cwd, "tsconfig.json"), join(rootPath, "tsconfig.json")].find(existsSync),
              tsconfigDefaults: {
                compilerOptions: {
                  // Generate declaration files by default
                  declaration: true,
                },
              },
              tsconfigOverride: {
                compilerOptions: {
                  // Support dynamic import
                  target: "esnext",
                },
              },
              check: !disableTypeCheck,
              ...(typescriptOpts || {}),
            }),
          ]
        : []),
      babel(babelConfig),
      json(),
      ...(extraRollupPlugins || []),
    ];
  }

  switch (type) {
    case "esm":
      return [
        {
          input,
          output: {
            format,
            file: join(cwd, `dist/${(esm && esm.file) || `${name}.esm`}.js`),
          },
          plugins: [...getPlugins(), ...(esm && esm.minify ? [terser(terserOpts)] : [])],
          external: testExternal.bind(null, external, externalsExclude),
        },
      ];

    case "cjs":
      return [
        {
          input,
          output: {
            format,
            file: join(cwd, `dist/${(cjs && cjs.file) || name}.js`),
          },
          plugins: [...getPlugins(), ...(cjs && cjs.minify ? [terser(terserOpts)] : [])],
          external: testExternal.bind(null, external, externalsExclude),
        },
      ];

    case "umd":
      // Add umd related plugins
      const extraUmdPlugins = [
        commonjs({
          include,
          // namedExports options has been remove from https://github.com/rollup/plugins/pull/149
        }),
      ];

      return [
        {
          input,
          output: {
            format,
            sourcemap: umd && umd.sourcemap,
            file: join(cwd, `dist/${(umd && umd.file) || `${name}.umd`}.js`),
            globals: umd && umd.globals,
            // name: (umd && umd.name) || (pkg.name && camelCase(basename(pkg.name))),
            name: "abc",
          },
          plugins: [
            ...getPlugins(),
            ...extraUmdPlugins,
            replace({
              "process.env.NODE_ENV": JSON.stringify("development"),
            }),
          ],
          external: testExternal.bind(null, externalPeerDeps, externalsExclude),
        },
        ...(umd && umd.minFile === false
          ? []
          : [
              {
                input,
                output: {
                  format,
                  sourcemap: umd && umd.sourcemap,
                  file: join(cwd, `dist/${(umd && umd.file) || `${name}.umd`}.min.js`),
                  globals: umd && umd.globals,
                  // name: (umd && umd.name) || (pkg.name && camelCase(basename(pkg.name))),
                  name: "abc",
                },
                plugins: [
                  ...getPlugins({ minCSS: true }),
                  ...extraUmdPlugins,
                  replace({
                    "process.env.NODE_ENV": JSON.stringify("production"),
                  }),
                  terser(terserOpts),
                ],
                external: testExternal.bind(null, externalPeerDeps, externalsExclude),
              },
            ]),
      ];

    default:
      throw new Error(`Unsupported type ${type}`);
  }
}
