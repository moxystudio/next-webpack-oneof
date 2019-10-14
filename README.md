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

By default webpack loaders will test all files for all loaders. However, webpack does support [`oneOf` rules](https://webpack.js.org/configuration/module/#ruleoneof), within which only the first matching rule will be used.

This plugin transfers all rules into a single `oneOf` rule, so no file will match more than one condition.


## Installation

```sh
$ npm install --save @moxy/next-webpack-oneof
```


## Motivation

In webpack loaders, rules to match against filenames are typically structured with the expectation that all files will try to match against all rules. With simple configurations this is not an issue, but can become problematic as complexity grows and, for example, you need different loaders for similar files.

As it is, the solution is using complex pairs of `include`/`exclude` in the rules. As the complexity of this problem grows, however, implementing these exclusion rules will get more confusing and become a hassle. To avoid this, files would have to **skip all rule matching tests after their first match**, to guarantee that no file matches against more than one rule by default.

Webpack implements a type of rule where that already happens, [`Rule.oneOf`](https://webpack.js.org/configuration/module/#ruleoneof), within which only the first matching rule will be used. But we want this that to be the default behavior.


## How

This plugin operates directly on the configuration object and pulls all rules into one single oneOf rule so that it becomes the default behavior for all rules.

This, in effect, changes how to think about loader rules as **the order of rules becomes of imperative importance**.

In `Next.js` you can use function composition to bundle together multiple operations on your webpack configuration. Given the nature of function composition, the order of execution is inverse to the nesting degree of each function call. As it concerns this plugin, because you always want this plugin to be the last function to be called, **it must be the topmost function in your composition** to guarantee that it has access on all loader rules in your project.


## Usage

Multiple configurations can be combined together with function composition. However, as explained above, this plugin must be the topmost function call. For example:

```js
// next.config.js
const withOneOf = require('@moxy/next-webpack-oneof');
const withCSS = require('@zeit/next-css');

module.exports = withOneOf(
    withCSS({
        cssModules: true,
    }),
);
```

To simplify using multiple plugins, you can also use [`next-compose-plugins`](https://github.com/cyrilwanner/next-compose-plugins). The examples in this document will use `next-compose-plugins`. As with the example above, `next-webpack-oneof` must be the topmost object. For example:

```js
//next.config.js
const withPlugins = require('next-compose-plugins');
const withOneOf = require('@moxy/next-webpack-oneof');
const withCSS = require('@zeit/next-css');

module.exports = withPlugins([
    withOneOf,
    [withCSS, {
        cssModules: true,
    }],
]);
```


## Examples

In the following examples, two loaders are used for .png files: one default loader, and one loader for specific .png files with `.base64.` somewhere in their filename.

### Without `next-webpack-oneof`

Using the standard webpack implementation, you would write the rules like so:

```js
// Without 'next-webpack-oneof'
const withPlugins = require('next-compose-plugins');

withPlugins([
    {
        webpack(config) {
            config.module.rules.push({
                // More specific rule to catch .png files that also match the `include` pattern
                test: /\.png$/,
                include: /\.base64\./
                loader: 'some-base64-loader,
            });

            config.module.rules.push({
                // General rule to catch all png files
                // Exclude files with '.base64.' in their filename
                test: /\.png$/,
                exclude: /\.base64\./
                loader: 'some-loader',
            });
        },
    },
])
```

To avoid confusing and introducing conflicts in this configuration, you must use a combination of `include` and `exclude` to guarantee that files don't fall through to multiple loaders.

### With `next-webpack-oneof`

Using `next-webpack-oneof` you can avoid having to declare complex rule exclusions, but you must be careful with the order of your rules. These examples explore how to use this plugin, and explain how the order of rules changes in different contexts.

If you're setting multiple rules in one plugin, the rules inside will output with the same order as they're written in. When you can expect this to be the case, rules with more specificity should be written before more general rules, like in this example:

```js
// With 'next-webpack-oneof'
const withPlugins = require('next-compose-plugins');
const withOneOf = require('@moxy/next-webpack-oneof');

withPlugins([
    withOneOf,
    {
        webpack(config) {
            // More specific rule to catch .png files that also match the `include` pattern
            config.module.rules.push({
                test: /\.png$/,
                include: /\.base64\./
                loader: 'some-base64-loader,
            });

            // General rule to catch all png files
            config.module.rules.push({
                test: /\.png$/,
                loader: 'some-loader',
            });
        },
    },
])
```

However, if you're setting rules in different plugins, the bottommost plugin will execute first, with order of execution going upwards from that point. In this case, plugins with rules with more specificity should be below plugins with more general rules, like in this example:

```js
// With 'next-webpack-oneof'
const withPlugins = require('next-compose-plugins');
const withOneOf = require('@moxy/next-webpack-oneof');

withPlugins([
    withOneOf,
    {
        webpack(config) {
            config.module.rules.push({
                // General rule to catch all png files
                test: /\.png$/,
                loader: 'some-loader',
            });
        },
    },
    {
        webpack(config) {
            config.module.rules.push({
                // More specific rule to catch .png files that also match the `include` pattern
                test: /\.png$/,
                include: /\.base64\./
                loader: 'some-base64-loader,
            });
    },
})
```


## Tests

Any parameter passed to the `test` command is passed down to Jest.

```sh
$ npm t
$ npm t -- --watch  # To run watch mode
```

## License

Released under the [MIT License](https://opensource.org/licenses/mit-license.php).
