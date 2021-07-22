import vue from 'rollup-plugin-vue';
export default [
  {
    file: 'my-component',
    type: ['cjs', 'esm', 'umd'],
    target: 'browser',
    extraExternals: ['vue'],
    extraBabelPresets: [require.resolve('@vue/babel-preset-jsx')],
    extraRollupPlugins: [vue({ css: false })],
    umd: {
      name: 'myComponent',
      globals: {
        vue: 'Vue',
      },
    },
  },
];
