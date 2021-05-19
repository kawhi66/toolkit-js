export default {
  file: "test-father",
  // type: "umd", // not recommended
  disableTypeCheck: false,
  target: "node",
  runtimeHelpers: false,
  lazy: true,
  umd: {
    name: "abc",
  },
};
