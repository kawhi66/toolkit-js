export default {
  file: "test-ibuild",
  // type: "umd", // not recommended
  disableTypeCheck: false,
  target: "browser",
  runtimeHelpers: false,
  lazy: true,
  umd: {
    name: "abc",
  },

  // type: ["esm", "umd"],
  // transform: true,
  // transformType: "cjs",
};
