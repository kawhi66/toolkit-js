export default {
  file: "test-ibuild",
  // type: ["cjs", "esm", "umd"],
  type: "esm",
  transform: true,
  transformType: "cjs",
  disableTypeCheck: false,
  target: "browser",
  runtimeHelpers: false,
  lazy: true,
  umd: {
    name: "abc",
  },
};
