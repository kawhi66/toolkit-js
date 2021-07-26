export default [
  {
    file: 'my-component',
    type: ['cjs', 'esm', 'umd'],
    target: 'browser',
    autoprefixer: {
      overrideBrowserslist: '> 1%, IE 6, Explorer >= 10, Safari >= 7',
    },
    umd: {
      name: 'myComponent',
    },
  },
];
