const eslintOptions = {
  extends: ['@winner-fed/win', '@winner-fed/win/vue'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
};

export default eslintOptions;

module.exports = eslintOptions;
