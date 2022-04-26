import babelJest from 'babel-jest';

export default babelJest.createTransformer({
  plugins: ['@babel/plugin-transform-modules-commonjs'],
  babelrc: false,
  configFile: false,
});
