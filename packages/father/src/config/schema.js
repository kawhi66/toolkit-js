const noEmptyStr = { type: "string", minLength: 1 };

export default {
  type: "object",
  additionalProperties: false,
  properties: {
    entry: noEmptyStr,
    file: { type: "string" },
    type: { type: "string", pattern: "^(cjs|esm|umd)$" },
    disableTypeCheck: { type: "boolean" },
    target: noEmptyStr,
    runtimeHelpers: { type: "boolean" },
    browserFiles: { type: "array" },
    nodeVersion: { type: "number" },
    nodeFiles: { type: "array" },
    lazy: { type: "boolean" },
    extraBabelPresets: { type: "array" },
    extraBabelPlugins: { type: "array" },
  },
};
