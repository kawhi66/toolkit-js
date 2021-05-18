const noEmptyStr = { type: "string", minLength: 1 };

export default {
  type: "object",
  additionalProperties: false,
  properties: {
    entry: noEmptyStr,
    file: { type: "string" },
    type: { type: "string", pattern: "^(cjs|esm|umd)$" },
    runtimeHelpers: { type: "boolean" },
    target: noEmptyStr,
    disableTypeCheck: { type: "boolean" },
  },
};
