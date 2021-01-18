'use strict';

module.exports = (nextConfig = {}) => ({
    ...nextConfig,
    webpack(config, options) {
        // Fix for Next.js >= 9.2, where it introduced a oneOf rules for CSS.
        // When there are nested oneOf rules, Webpack stops at the first occurrence of a `oneOf` rule
        // because it has no conditions (test, exclude, etc).
        // We fix that by adding a test condition to the CSS oneOf rule.
        const cssRule = config.module.rules.find((rule) => (
            rule.oneOf && Object.keys(rule).length === 1) &&
            rule.oneOf.some((rule) => `${rule.test}`.includes('\\.module\\.css')),
        );

        if (cssRule) {
            cssRule.test = /\.css$/;
        }

        config.module.rules = [{
            oneOf: [...config.module.rules],
        }];

        if (typeof nextConfig.webpack === 'function') {
            return nextConfig.webpack(config, options);
        }

        return config;
    },
});
