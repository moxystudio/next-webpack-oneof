# next-webpack-oneof

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/@moxy/next-webpack-oneof
[downloads-image]:https://img.shields.io/npm/dm/@moxy/next-webpack-oneof.svg
[npm-image]:https://img.shields.io/npm/v/@moxy/next-webpack-oneof.svg
[travis-url]:https://travis-ci.org/moxystudio/next-webpack-oneof
[travis-image]:http://img.shields.io/travis/moxystudio/next-webpack-oneof/master.svg
[codecov-url]:https://codecov.io/gh/moxystudio/next-webpack-oneof
[codecov-image]:https://img.shields.io/codecov/c/github/moxystudio/next-webpack-oneof/master.svg
[david-dm-url]:https://david-dm.org/moxystudio/next-webpack-oneof
[david-dm-image]:https://img.shields.io/david/moxystudio/next-webpack-oneof.svg
[david-dm-dev-url]:https://david-dm.org/moxystudio/next-webpack-oneof?type=dev
[david-dm-dev-image]:https://img.shields.io/david/dev/moxystudio/next-webpack-oneof.svg

Wraps all webpack loader rules into a single oneOf rule.

By default webpack loaders will test all files for all loaders. However, webpack does support [`oneOf` rules](https://webpack.js.org/configuration/module/#ruleoneof), with which only the first matching rule will be used.

This plugin transfers all rules into a single `oneOf` rule, so no file can be tested twice.


## Installation

```sh
$ npm install --save @moxy/next-webpack-oneof
```


## Usage

In your `next.config.js` file:

```js
const alwaysOneOf = require('@moxy/next-webpack-oneof');

module.exports = alwaysOneOf({...nextConfig});
```

This plugin must be passed as the first loader rule in your `next.config.js` file, as it works by spreading rules already present in your webpack `config` into a `oneOf` object, and must be placed where it will have access to all rules, which, as per the webpack implementation (explained further below), is **before** the rest of your rules in your exporting object.

## Why

In webpack loaders, rules to match against filenames are typically structured with the expectation that all files will try to match against all rules. With simple configurations this is not an issue, but can become problematic as complexity grows and, for example, you need different loaders for similar files.

As it is, the solution is using complex pairs of `include`/`exclude` in the rules. To avoid this, files would have to skip all rule matching tests after their first match.

Webpack implements a type of rule where that already happens, [`Rule.oneOf`](https://webpack.js.org/configuration/module/#ruleoneof), within which only the first matching rule will be used. This plugin **pulls all rules into one single oneOf rule** so that it becomes the **default behavior for all files.**

This, in effect, changes how to think about loaders as **the order of loaders becomes of imperative importance**, and as such it's required of the developer to have some awareness of how rules are loaded into webpack, namely **from the bottom up**.


## Examples

In the following example, two loaders are used for SVG files: one default loader, and one loader for specific SVG files with `.base64.` somewhere in their filename. Webpack test files against loaders from the bottom up, so **rules with more specificity should be written bellow more general rules**. In practice, SVG files with a `.base64.` suffix will be caught by the first (read: bottom) rule, and those without will fallback to the consequent rule.

```js
{
    // General rule to catch all SVG files
    test: /\.svg$/,
    loader: 'some-loader',
},
{
    // More specific rule to catch SVG files that also match the `include` pattern
    test: /\.svg$/,
    include: /\.base64\./
    loader: 'some-base64-loader,
},
```


### Tests

Any parameter passed to the `test` command is passed down to Jest.

```sh
$ npm t
$ npm t -- --watch  # To run watch mode
```

### License

Released under the [MIT License](https://opensource.org/licenses/mit-license.php).
