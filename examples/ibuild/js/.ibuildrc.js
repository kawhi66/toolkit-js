export default [
  {
    file: 'my-vue-plugin',
    type: ['cjs', 'esm', 'umd'],
    target: 'browser',
    umd: {
      name: 'myVuePlugin',
    },
  },
];
