'use strict';

module.exports = (nextConfig = {}) => ({
    ...nextConfig,
    webpack(config, options) {
        config.module.rules = [{
            oneOf: [...config.module.rules],
        }];

        if (typeof nextConfig.webpack === 'function') {
            return nextConfig.webpack(config, options);
        }

        return config;
    },
});
