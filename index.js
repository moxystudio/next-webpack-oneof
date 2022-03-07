'use strict';

module.exports = (nextConfig = {}) => ({
    ...nextConfig,
    webpack(config, options) {
        // 1) Fix for Next.js >= 12, where three matches for JS files are found.
        //    We need to take the first two and put it out of the `oneOf` rule.
        const jsNoExtensionRule1 = config.module.rules.find((rule) =>
            // Test for rule where JS is matched and resolve.fullySpecified is set to false.
            rule.test instanceof RegExp && /\bjs\b/.test(rule.test.toString()) &&
            rule.resolve && rule.resolve.fullySpecified === false &&
            !rule.loader &&
            !rule.use,
        );

        const jsNoExtensionRule2 = config.module.rules.find((rule) =>
            // Test for rule where JS is matched and resolve.fullySpecified is set to false.
            rule.test instanceof RegExp && /\bjs\b/.test(rule.test.toString()) &&
            rule.issuerLayer === 'api',
        );

        if (jsNoExtensionRule1) {
            config.module.rules = config.module.rules.filter((rule) => rule !== jsNoExtensionRule1);
        }
        if (jsNoExtensionRule2) {
            config.module.rules = config.module.rules.filter((rule) => rule !== jsNoExtensionRule2);
        }

        // 2) Fix for Next.js >= 11, where it's built-in detection of a SVG rule does not work correctly,
        //    because we will be wrapping everything.
        //    See: https://github.com/vercel/next.js/blob/3cd4f34dc80313f8144dbf0008719999e552bc72/packages/next/build/webpack-config.ts#L1473
        const svgRule = config.module.rules.find((rule) => rule.test instanceof RegExp && rule.test.test('.svg'));

        // 3) Fix for Next.js >= 12, where it introduced a oneOf rules for JS & CSS.
        //    When there are nested oneOf rules, Webpack stops at the first occurrence of a `oneOf` rule
        //    because it has no conditions (test, exclude, etc).
        //    We fix that by adding a test condition to the oneOf rule.
        const jsAndCssRule = config.module.rules.find((rule) =>
            rule.oneOf &&
            Object.keys(rule).length === 1 &&
            rule.oneOf.some((rule) => /\bcss\b/.test(`${rule.test}`)) &&
            rule.oneOf.some((rule) => /\bjs\b/.test(`${rule.test}`)),
        );

        if (jsAndCssRule) {
            jsAndCssRule.test = /\.(tsx|ts|js|cjs|mjs|jsx|css|scss|sass)$/;
        }

        // Finally wrap everything in `oneOf`.
        config.module.rules = [{
            oneOf: [...config.module.rules],
        }];

        // Continuation for fix 2).
        if (svgRule) {
            config.module.rules.unshift({
                test: /\.svg$/,
            });
        }

        // Continuation for fix 1).
        if (jsNoExtensionRule2) {
            config.module.rules.unshift(jsNoExtensionRule2);
        }
        if (jsNoExtensionRule1) {
            config.module.rules.unshift(jsNoExtensionRule1);
        }

        if (typeof nextConfig.webpack === 'function') {
            return nextConfig.webpack(config, options);
        }

        return config;
    },
});
