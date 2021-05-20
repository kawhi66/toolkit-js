export default {
  file: "test-ibuild",
  // type: ["cjs", "esm", "umd"],
  type: "cjs",
  transform: true,
  // transformType: "esm",
  disableTypeCheck: false,
  target: "browser",
  runtimeHelpers: false,
  lazy: true,
  umd: {
    name: "abc",
  },
};
