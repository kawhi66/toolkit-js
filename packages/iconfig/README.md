# iconfig

一个包含 prettier，eslint，stylelint 的配置文件合集

A collection of configuration files containing prettier, eslint, stylelint inspired by [umi-fabric](https://github.com/umijs/fabric)

## Usage

You can install iconfig using npm:

```bash
$ npm install @toolkit-js/iconfig --save-dev
```

## Configuration

in `.prettierrc.js`

```js
const { prettier } = require('@toolkit-js/iconfig');

module.exports = {
  ...prettier,
};
```

in `.eslintrc.js`

```js
module.exports = {
  extends: [require.resolve('@toolkit-js/iconfig/lib/eslintrc')],

  rules: {
    // your rules
  },
};
```

in `.stylelintrc.js`

```js
module.exports = {
  extends: [require.resolve('@toolkit-js/iconfig/lib/stylelintrc')],

  rules: {
    // your rules
  },
};
```

## prettierOptions

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "proseWrap": "never",
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

## eslintOptions

### extends

```js
[
  'airbnb-base',
  'plugin:eslint-comments/recommended',
  'plugin:vue/essential',
  'prettier',
  ...(isTsProject ? ['plugin:@typescript-eslint/recommended'] : []),
];
```

### plugins

```js
['jest', 'unicorn'];
```

### rules

```js
{
  // enforce that class methods use "this"
  // https://eslint.org/docs/rules/class-methods-use-this
  "class-methods-use-this": 0,

  // disallow reassignment of function parameters
  // disallow parameter object manipulation except for specific exclusions
  // rule: https://eslint.org/docs/rules/no-param-reassign.html
  "no-param-reassign": 2,

  // enforce the spacing around the * in generator functions
  // https://eslint.org/docs/rules/generator-star-spacing
  "generator-star-spacing": 0,

  // import sorting
  // https://eslint.org/docs/rules/sort-imports
  "sort-imports": 0,

  // disallow arrow functions where they could be confused with comparisons
  // https://eslint.org/docs/rules/no-confusing-arrow
  "no-confusing-arrow": 0,

  // enforces no braces where they can be omitted
  // https://eslint.org/docs/rules/arrow-body-style
  // TODO: enable requireReturnForObjectLiteral?
  "arrow-body-style": 0,

  // require parens in arrow function arguments
  // https://eslint.org/docs/rules/arrow-parens
  "arrow-parens": 0,

  // enforce consistent line breaks inside function parentheses
  // https://eslint.org/docs/rules/function-paren-newline
  "function-paren-newline": 0,

  // disallow mixed 'LF' and 'CRLF' as linebreaks
  // https://eslint.org/docs/rules/linebreak-style
  "linebreak-style": 0,

  // enforce line breaks between braces
  // https://eslint.org/docs/rules/object-curly-newline
  "object-curly-newline": 0,

  // Enforce the location of arrow function bodies with implicit returns
  // https://eslint.org/docs/rules/implicit-arrow-linebreak
  "implicit-arrow-linebreak": 0,

  // Requires operator at the beginning of the line in multiline statements
  // https://eslint.org/docs/rules/operator-linebreak
  "operator-linebreak": 0,

  // require or disallow space before function opening parenthesis
  // https://eslint.org/docs/rules/space-before-function-paren
  "space-before-function-paren": 0,

  // disallow use of Object.prototypes builtins directly
  // https://eslint.org/docs/rules/no-prototype-builtins
  "no-prototype-builtins": 0,

  "import/no-unresolved": 0,
  "import/order": 0,
  "import/no-named-as-default": 0,
  "import/no-cycle": 0,
  "import/prefer-default-export": 0,
  "import/no-default-export": 0,
  "import/no-extraneous-dependencies": 0,
  "import/named": 0,
  "import/no-named-as-default-member": 0,
  "import/no-duplicates": 0,
  "import/no-self-import": 0,
  "import/extensions": 0,
  "import/no-useless-path-segments": 0,
  "eslint-comments/no-unlimited-disable": 0,
  "unicorn/prevent-abbreviations": 0
}
```

## stylelintOptions

### extends

```js
[
  'stylelint-config-standard',
  'stylelint-config-css-modules',
  'stylelint-config-rational-order',
  'stylelint-config-prettier',
],
```

### plugins

```js
[
  'stylelint-order',
  'stylelint-no-unsupported-browser-features',
  'stylelint-declaration-block-no-ignored-properties',
];
```

### rules

```json
{
  "font-family-no-missing-generic-family-keyword": null, // iconfont
  "function-calc-no-invalid": null,
  "function-url-quotes": "always",
  "no-descending-specificity": null,
  "unit-no-unknown": [
    true,
    {
      "ignoreUnits": ["rpx"]
    }
  ],
  "plugin/declaration-block-no-ignored-properties": true
}
```
