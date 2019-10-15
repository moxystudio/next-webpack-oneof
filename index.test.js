'use strict';

const alwaysOneOf = require('./index');

const createConfig = (loaderRules = []) => ({
    module: {
        rules: [...loaderRules],
    },
});

it('should return in .oneOf rules sent in .rules', () => {
    const rules = [{
        should: 'work',
    }];

    const createOneOf = (loaderRules = []) => ({
        module: {
            rules: [{
                oneOf:
                    [...loaderRules],
            }],
        },
    });

    const webpackConfig = alwaysOneOf().webpack(createConfig(rules));

    expect(webpackConfig).toMatchSnapshot();
    expect(webpackConfig).toStrictEqual(createOneOf(rules));
});

it('should call nextConfig webpack if defined', () => {
    const nextConfig = {
        webpack: jest.fn(() => 'foo'),
    };

    const webpackConfig = alwaysOneOf(nextConfig).webpack(createConfig());

    expect(nextConfig.webpack).toHaveBeenCalledTimes(1);
    expect(webpackConfig).toBe('foo');
});
