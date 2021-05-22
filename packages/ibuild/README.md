# `ibuild`

**Library build tool** inspired by [father](https://github.com/umijs/father).

## Features

- ✔︎ 基于 [rollup](http://rollupjs.org/) 和 babel 的组件打包功能
- ✔︎ 支持 TypeScript
- ✔︎ 支持 cjs、esm 和 umd 三种格式的打包
- ✔︎ 支持 transform 模式
- ✔︎ 支持 lerna

## Installation

Install `ibuild` via yarn or npm.

```bash
$ yarn add @toolkit-js/ibuild -D
```

## Usage

```json
//  package.json
{
  "main": "index.js",
  "scripts": {
    "build": "ibuild"
  }
}
```

```bash
# Bundle library
$ yarn build
```

## Config

新建 `.ibuildrc.js` 文件进行配置。

比如：

```js
// .ibuildrc.js
export default {
  // type: ["cjs", "esm", "umd"],
  type: "esm",
  transform: true,
  transformType: "cjs",
  disableTypeCheck: false,
  target: "browser",
  umd: {
    name: "foo",
  },
};
```

注意：配置文件支持 es6 和 TypeScript

### Options

#### entry

指定入口文件。

- Type: `string`
- Default：`src/index.js`

注：事实上，我们会依次找 `src/index.tsx`, `src/index.ts`, `src/index.jsx`, `src/index.js`，如果存在，则会作为默认的 entry。如果库文件为 `typescript`，则需要在根目录配置`tsconfig.json`，否则会编译错误。

#### file

指定输出文件。

- Type: `string`
- Default: 与 entry 相同的文件名，esm 会加 `.esm.js` 后缀，umd 会加 `.umd[.min].js` 后缀

#### type

- Type: `string | string[]`
- Default：`undefined`

指定构建类型，支持 cjs, esm, umd 三种，可以配置多个。

#### umd

指定 umd 的相关配置。

- Type: `{ globals, name, sourcemap }`
- Default: `undefined`

#### umd.globals

指定 rollup 的 [globals](https://rollupjs.org/guide/en#output-globals) 配置。

#### umd.name

指定 rollup 的 [name](https://rollupjs.org/guide/en#output-name) 配置。

- Type: `string`
- Default: `${camelCase(basename(pkg.name))}`

#### umd.sourcemap

是否同步输出 sourcemap。

- Type: `boolean`
- Default: `undefined`

#### transform

是否执行源码的编译转换任务。

- Type: `boolean`
- Default: `false`

#### transformType

指定源码的编译类型，支持 cjs 和 esm 两种，不支持配置多个。

- Type: `string`
- Default: `undefined`

#### autoprefixer

配置参数传给 autoprefixer，详见 [autoprefixer#options](https://github.com/postcss/autoprefixer#options)，常用的有 `flexbox` 和 `browsers`。

比如：

```js
export default {
  autoprefixer: {
    browsers: ["ie>8", "Safari >= 6"],
  },
};
```

#### cssModules

配置是否开启 css modules。

- Type: `boolean | object`
- Default: `false`

默认是 `.module.css` 走 css modules，`.css` 不走 css modules。配置 `cssModules` 为 `true` 后，全部 css 文件都走 css modules。（less 文件同理）

如果配置了 object，会被透传给 [postcss-modules](https://github.com/css-modules/postcss-modules)。

比如，要定制 css modules 的样式名前缀，

```js
export default {
  cssModules: {
    generateScopedName: "foo-bar_[name]__[local]___[hash:base64:5]",
  },
};
```

#### extractCSS

配置是否提取 css 为单独文件。

- Type: `boolean`
- Default: `false`

#### injectCSS

是否在 \<head>里注入 css, 如果`extractCSS: true`，则为`false`

- Type: `boolean | function`
- Default: `true`

#### extraBabelPresets

配置额外的 babel preset。

- Type: `array`
- Default: `[]`

#### extraBabelPlugins

配置额外的 babel plugin。

- Type: `array`
- Default: `[]`

比如配置 babel-plugin-import 按需加载 antd，

```js
export default {
  extraBabelPlugins: [
    [
      "babel-plugin-import",
      {
        libraryName: "antd",
        libraryDirectory: "es",
        style: true,
      },
    ],
  ],
};
```

#### extraPostCSSPlugins

配置额外的 postcss plugin。

- Type: `array`
- Default: `[]`

#### extraRollupPlugins

配置额外的 rollup plugin。

- Type: `array`
- Default: `[]`

```js
import url from "rollup-plugin-url";

export default {
  extraRollupPlugins: [url()],
};
```

#### extraExternals

为 rollup 模式配置额外的 external，但不推荐这么做，external 可通过 dependencies 和 peerDependencies 的约定实现。

- Type: `string[]`
- Default: `[]`

#### externalsExclude

配置一些依赖不走 externals。

- Type: `string[]`
- Default: `[]`

比如 'foo' 走 externals，而 `foo/bar` 不走，可以这么配，

```js
export default {
  extraExternals: ["foo"],
  externalsExclude: ["foo/bar"],
};
```

#### include

配置 rollup-plugin-commonjs 的 [include][https://github.com/rollup/rollup-plugin-commonjs#usage]。

#### nodeResolveOpts

配置 [rollup-plugin-node-resolve](https://github.com/rollup/rollup-plugin-node-resolve) 参数。

#### disableTypeCheck

是否禁用类型检测。

- Type: `boolean`
- Default: `false`

#### target

配置是 node 库还是 browser 库，只作用于语法层。

- Type: `"node" | "browser"`
- Default: `"browser"`

如果为 `node`，兼容到 node@6；如果为 `browser`，兼容到 `['last 2 versions', 'IE 10']`，所以肯定会是 es5 的语法。

#### browserFiles

target 为 `node` 时，配置例外文件走 `browser` target。

- Type: `[string]`
- Default: `[]`

注：

1. 所有 `.tsx` 和 `.jsx` 文件始终走 `browser` target。

#### nodeFiles

target 为 `browser` 时，配置例外文件走 `node` target。

- Type: `[string]`
- Default: `[]`

#### runtimeHelpers

是否把 helper 方法提取到 `@babel/runtime` 里。

- Type: `boolean`
- Default: `false`

注：

1. 推荐开启，能节约不少尺寸
2. 配置了 `runtimeHelpers`，一定要在 dependencies 里有 `@babel/runtime` 依赖
3. runtimeHelpers 只对 esm 有效，cjs 下无效，因为 cjs 已经不给浏览器用了，只在 ssr 时会用到，无需关心小的尺寸差异

#### replace

配置需要替换的内容，基于 [rollup-plugin-replace](https://github.com/rollup/rollup-plugin-replace)。

- Type: `Object`
- Default: `{}`

注：

1. transform 模式下暂不支持
2. 如果要输出字符串，值的部分用 `JSON.stringify()` 转下

比如：

```js
export default {
  replace: {
    VERSION: JSON.stringify(require("./package").version),
  },
};
```

#### inject

配置需要替换成依赖引用的全局变量 Map，基于 [rollup-plugin-inject](https://github.com/rollup/rollup-plugin-inject)。

- Type: `Object`
- Default: `{}`

比如：

```js
export default {
  inject: {
    "window.foo": "foo",
  },
};
```

那么，

```js
console.log(window.foo);
```

会被编译成，

```js
import $inject_window_foo from "foo";
console.log($inject_window_foo);
```

#### nodeVersion

指定 node 版本。

- Type: `Number`
- Default: `6`

比如：

```js
export default {
  target: "node",
  nodeVersion: 8,
};
```

## Bonus

使用建议：

1. 通常只要配置 `type: "esm"` 就够了
2. build 模式是跟进 entry 把项目依赖打包在一起输出一个文件，支持 cjs | esm | umd 三种类型；transform 模式是把 src 目录转化成 lib，仅支持 cjs | esm 两种类型
3. `package.json` 里配上 `sideEffects: false | string[]`，会让 webpack 的 [tree-shaking](https://webpack.js.org/guides/tree-shaking/) 更高效

### 关于 dependencies、peerDependencies 和 external

1. build 模式下，选择 cjs 或者 esm 类型时，dependencies 和 peerDependencies 里的内容会被 external
2. umd 格式，只有 peerDependencies 会被 external
3. transform 模式无需考虑 external，因为是文件到文件的编译，不处理文件合并

### 关于 transform 模式

transform 模式下一些文件不会被编译到 lib 下，包含：

- `__test__` 目录
- `fixtures` 目录
- `demos` 目录
- `mdx` 文件
- `md` 文件
- 测试文件，比如 `test.js`、`spec.js`、`e2e.js`，后缀还支持 `jsx`、`ts` 和 `tsx`

## LICENSE

MIT
