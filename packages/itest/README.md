# itest

**Unit or Component test tool**.

## Features

- ✔︎ 基于 [Jest](https://jestjs.io/) 支持单元测试
- ✔︎ 基于 [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/intro/) 支持 [Vue2](https://cn.vuejs.org/) 的组件测试
- ✔︎ 支持 jsx
- ✔︎ 支持 TypeScript

## Installation

Install `itest` via yarn or npm.

```bash
$ yarn add @toolkit-js/itest -D
```

## Usage

```json
//  package.json
{
  "main": "index.js",
  "scripts": {
    "test": "itest"
  }
}
```

```bash
# Run tests
$ yarn test
```

## Unit Test Example

```js
// count.js
export function add(input) {
  return input + 1;
}
```

```js
// count.test.js
import { add } from './count';

it('count', () => {
  expect(add(1)).toBe(2);
});
```

## Component Test Example

```html
<!-- HelloWorld.vue -->
<template>
  <div>
    <h1>{{ msg }}</h1>
  </div>
</template>

<script>
  export default {
    name: 'HelloWorld',
    props: {
      msg: String,
    },
  };
</script>
```

```js
// HelloWorld.test.js
import { render } from '@testing-library/vue';
import HelloWorld from './HelloWorld.vue';

test('renders props.msg when passed', async () => {
  // The render method returns a collection of utilities to query your component.
  const msg = 'new message';
  const { getByText } = render(HelloWorld, {
    props: {
      msg,
    },
  });

  // getByText returns the first matching node for the provided text, and
  // throws an error if no elements match or if more than one match is found.
  getByText(msg);
});
```
