import { resolve } from 'path';
import nodePolyfills from 'rollup-plugin-node-polyfills';
export default [
  {
    file: 'test-ibuild',
    // type: ["cjs", "esm", "umd"],
    type: 'esm',
    transform: true,
    transformType: 'cjs',
    disableTypeCheck: false,
    target: 'browser',
    runtimeHelpers: false,
    lazy: true,
    umd: {
      name: 'abc',
    },
  },
  {
    entry: 'src/utils.js',
    file: 'test-utils',
    type: 'esm',
    umd: {
      name: 'abcd',
    },
  },
  {
    entry: 'src/socket.js',
    file: 'worker',
    type: 'umd',
    nodeResolveOpts: {
      browser: true,
      jail: resolve(__dirname, 'node_modules'),
      preferBuiltins: false,
    },
    extraRollupPlugins: [nodePolyfills()],
    overridesBabel: [
      {
        test: 'src/**',
        include: [resolve(__dirname, 'node_modules')],
        compact: true,
      },
    ],
  },
];
