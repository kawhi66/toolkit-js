const stylelintOptions = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-css-modules',
    'stylelint-config-rational-order',
    'stylelint-config-prettier',
  ],
  plugins: [
    'stylelint-order',
    'stylelint-no-unsupported-browser-features',
    'stylelint-declaration-block-no-ignored-properties',
  ],
  rules: {
    'font-family-no-missing-generic-family-keyword': null, // iconfont
    'function-calc-no-invalid': null,
    'function-url-quotes': 'always',
    'no-descending-specificity': null,
    'unit-no-unknown': [
      true,
      {
        ignoreUnits: ['rpx'],
      },
    ],
    'plugin/declaration-block-no-ignored-properties': true,
  },
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
};

export default stylelintOptions;

module.exports = stylelintOptions;
