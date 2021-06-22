# icss

**CSS build tool**.

## Features

- ✔︎ 支持 less、scss
- ✔︎ 支持 postcss 以及扩展其默认配置项

## Installation

Install `icss` via yarn or npm.

```bash
$ yarn add @toolkit-js/icss -D
```

## Usage

```json
//  package.json
{
  "main": "index.js",
  "scripts": {
    "icss": "icss"
  }
}
```

```bash
# bundle css
$ yarn icss src/style/index.css
# bundle less
$ yarn icss src/style/index.less
# bundle scss
$ yarn icss src/style/index.scss
# wrap selector before css rule
$ yarn icss src/style/index.scss --root-selector .blue
# build in glob
$ yarn icss src/style/*.less
# copy non-style file
$ yarn icss src/fonts/**
```

## Postcss

支持按照 postcss 的方式扩展默认的配置项，比如新建 `.postcssrc.js` 文件：

```js
module.exports = {
  plugins: [require('@postcss-plugins/console')],
};
```

默认的配置项如下：

```js
userOptions.plugins = [
  atImport(),
  prefixWrap(rootSelector),
  ...userOptions.plugins, // user plugins
  autoprefixer({
    overrideBrowserslist: ['ie > 9', 'last 2 versions'],
    cascade: false,
  }),
  cssnano(),
];
```

## Tip

如果遇到 node-sass 安装报错的问题，可以设置 `.npmrc` 文件：

```
sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
```
