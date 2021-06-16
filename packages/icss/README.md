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
# Bundle library
$ yarn icss index.css
$ yarn icss index.less
$ yarn icss src/*.less
```

## Tip

gulp-sass 作为 peerDependencies 被依赖，支持 scss 需要手动确认在当前的项目下 gulp-sass 已经正确安装。
