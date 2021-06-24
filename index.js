'use strict';

module.exports = (nextConfig = {}) => ({
    ...nextConfig,
    webpack(config, options) {
        // 1) Fix for Next.js >= 11, where two matches for JS files are found.
        //    We need to take the first one ({ resolve: { fullySpecified: false }}), and put it out of the `oneOf` rule.
        const jsNoExtensionRule = config.module.rules.find((rule) =>
            // Test for rule where JS is matched and resolve.fullySpecified is set to false.
            rule.test instanceof RegExp && rule.test.toString().endsWith('js/') &&
            rule.resolve && rule.resolve.fullySpecified === false &&
            !rule.loader &&
            !rule.use,
        );

        if (jsNoExtensionRule) {
            config.module.rules = config.module.rules.filter((rule) => rule !== jsNoExtensionRule);
        }

        // 2) Fix for Next.js >= 11, where it's built-in detection of a SVG rule does not work correctly,
        //    because we will be wrapping everything.
        //    See: https://github.com/vercel/next.js/blob/3cd4f34dc80313f8144dbf0008719999e552bc72/packages/next/build/webpack-config.ts#L1473
        const hasSvgRule = config.module.rules.find((rule) => rule.test instanceof RegExp && rule.test.test('.svg'));

        // 3) Fix for Next.js >= 9.2, where it introduced a oneOf rules for CSS.
        //    When there are nested oneOf rules, Webpack stops at the first occurrence of a `oneOf` rule
        //    because it has no conditions (test, exclude, etc).
        //    We fix that by adding a test condition to the CSS oneOf rule.
        const cssRule = config.module.rules.find((rule) =>
            rule.oneOf &&
            Object.keys(rule).length === 1 &&
            rule.oneOf.some((rule) => `${rule.test}`.includes('\\.module\\.css')),
        );

        if (cssRule) {
            cssRule.test = /\.css$/;
        }

        // Finally wrap everything in `oneOf`.
        config.module.rules = [{
            oneOf: [...config.module.rules],
        }];

        // Continuation for fix 1).
        if (jsNoExtensionRule) {
            config.module.rules.unshift(jsNoExtensionRule);
        }

        // Continuation for fix 3).
        if (hasSvgRule) {
            config.module.rules.unshift({
                test: /\.svg$/,
            });
        }

        if (typeof nextConfig.webpack === 'function') {
            return nextConfig.webpack(config, options);
        }

        return config;
    },
});
