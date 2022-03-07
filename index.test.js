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

it('should add condition to Next.js built-in oneOf rule that adds JS & CSS support', () => {
    const rules = [{
        oneOf: [
            {
                test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
            },
            {
                test: /\.module\.css$/,
            },
        ],
    }];

    const webpackConfig = alwaysOneOf().webpack(createConfig(rules));

    expect(webpackConfig).toMatchSnapshot();
});

it('should not wrap rule JS rules that should be fallthrough', () => {
    const rules = [
        {
            test: /\.m?js/,
            resolve: {
                fullySpecified: false,
            },
        },
        {
            test: /\.(js|cjs|mjs)$/,
            issuerLayer: 'api',
        },
        {
            oneOf: [
                {
                    test: /\.(tsx|ts|js|cjs|mjs|jsx)$/,
                },
                {
                    test: /\.module\.css$/,
                },
            ],
        },
    ];

    const webpackConfig = alwaysOneOf().webpack(createConfig(rules));

    expect(webpackConfig).toMatchSnapshot();
});

it('should add noop SVG rule at the root if a SVG rule was detected', () => {
    const rules = [
        {
            test: /\.svg$/,
            loader: 'foo',
        },
    ];

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
