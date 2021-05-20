# `ibuild`

## Usage

```
$ ibuild -h

  Usage: ibuild [options]

  Options:

    --transform         Skip bundle and transform src to lib (default: false)
    -t, --type          Use specified build type (cjs | esm | umd, default: cjs)
    -w, --watch         Watch building (default: false)
    -h, --help          Print help
    -v, --version       Print version
```

```js
// .ibuildrc.js
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
};
```
