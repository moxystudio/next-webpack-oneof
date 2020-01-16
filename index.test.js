'use strict';

const alwaysOneOf = require('./index');

const createConfig = (loaderRules = []) => ({
    module: {
        rules: [...loaderRules],
    },
});

it('should return in .oneOf rules sent in .rules', () => {
    const rules = [{
        test: /\.js$/,
    }];

    const webpackConfig = alwaysOneOf().webpack(createConfig(rules));

    expect(webpackConfig).toMatchSnapshot();
});

it('should add condition to Next.js built-in oneOf rule that adds CSS support', () => {
    const rules = [{
        oneOf: [{
            test: /\.module\.css$/,
        }],
    }];

    const webpackConfig = alwaysOneOf().webpack(createConfig(rules));

    expect(webpackConfig).toMatchSnapshot();
});

it('should call nextConfig webpack if defined', () => {
    const nextConfig = {
        webpack: jest.fn(() => 'foo'),
    };

    const webpackConfig = alwaysOneOf(nextConfig).webpack(createConfig());

    expect(nextConfig.webpack).toHaveBeenCalledTimes(1);
    expect(webpackConfig).toBe('foo');
});
