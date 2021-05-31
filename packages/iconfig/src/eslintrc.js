import * as fs from 'fs';
import * as path from 'path';
import tsEslintConfig from './tsEslintConfig';

const isTsProject = fs.existsSync(path.join(process.cwd() || '.', './tsconfig.json'));

const eslintOptions = {
  extends: [
    'airbnb-base',
    'plugin:eslint-comments/recommended',
    'plugin:vue/essential',
    'prettier',
    ...(isTsProject ? ['plugin:@typescript-eslint/recommended'] : []),
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  parserOptions: {
    // https://eslint.vuejs.org/user-guide/#how-to-use-a-custom-parser
    parser: isTsProject ? '@typescript-eslint/parser' : '@babel/eslint-parser',
    ecmaFeatures: { jsx: true },
    babelOptions: {
      presets: ['@babel/preset-env', '@babel/preset-typescript'],
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        ['@babel/plugin-proposal-private-methods', { loose: true }],
      ],
    },
    requireConfigFile: false,
    project: './tsconfig.json',
  },
  plugins: ['jest', 'unicorn'],
  rules: {
    'eslint-comments/no-unlimited-disable': 0,
    'unicorn/prevent-abbreviations': 0,
    ...(isTsProject ? tsEslintConfig : {}),
  },
  settings: {
    polyfills: ['fetch', 'Promise', 'URL', 'object-assign'],
  },
};

export default eslintOptions;

module.exports = eslintOptions;
