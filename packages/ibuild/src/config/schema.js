const noEmptyStr = { type: 'string', minLength: 1 };
const buildType = { type: 'string', pattern: '^(cjs|esm|umd)$' };
const transformType = { type: 'string', pattern: '^(cjs|esm)$' };

export default {
  type: 'object',
  additionalProperties: false,
  properties: {
    entry: noEmptyStr,
    file: { type: 'string' },
    type: { oneOf: [buildType, { type: 'array', items: buildType }] },
    transform: { type: 'boolean' },
    transformType: transformType,
    disableTypeCheck: { type: 'boolean' },
    target: noEmptyStr,
    runtimeHelpers: { type: 'boolean' },
    browserFiles: { type: 'array' },
    nodeVersion: { type: 'number' },
    nodeFiles: { type: 'array' },
    lazy: { type: 'boolean' },
    babelExclude: { oneOf: [{ type: 'string' }, { type: 'object' }, { type: 'array' }] },
    extraBabelPresets: { type: 'array' },
    extraBabelPlugins: { type: 'array' },
    cssModules: { oneOf: [{ type: 'boolean' }, { type: 'object' }] },
    extractCSS: { type: 'boolean' },
    injectCSS: { oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }] },
    extraPostCSSPlugins: { type: 'array' },
    extraRollupPlugins: { type: 'array' },
    autoprefixer: { type: 'object' },
    replace: { type: 'object' },
    inject: { type: 'object' },
    extraExternals: { type: 'array' },
    externalsExclude: { type: 'array' },
    typescriptOpts: { type: 'object' },
    nodeResolveOpts: { type: 'object' },
    minify: { type: 'boolean' },
    umd: {
      type: 'object',
      additionalProperties: false,
      properties: {
        globals: { type: 'object' },
        name: noEmptyStr,
        sourcemap: {
          oneOf: [{ type: 'boolean' }, { type: 'string', pattern: '^(inline|hidden)$' }],
        },
      },
    },
  },
};
