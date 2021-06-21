# icss

**CSS build tool**.

## Features

- ✔︎ 支持 less、scss

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

## Tip

如果遇到 node-sass 安装报错的问题，可以设置 `.npmrc` 文件：

```
sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
```
