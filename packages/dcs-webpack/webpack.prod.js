process.env.REACT_APP_ENV = 'production';
process.env.NODE_ENV = 'production';

const paths = require('./webpack.paths');
const path = require('path');
const { merge } = require('webpack-merge');
const { baseConfig, commonRules, commonPlugins, htmlPlugins, prodPlugins } = require('./webpack.common.js');

const isForDeploy = process.env.REACT_APP_ENV === 'release' || process.env.REACT_APP_ENV === 'production';
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

module.exports = merge(baseConfig, {
    mode: 'production',
    module: {
        rules: commonRules
    },
    plugins: [...htmlPlugins, ...commonPlugins, ...prodPlugins],
    optimization: {
        splitChunks: {
            chunks: 'all',
            // https://medium.com/hackernoon/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    reuseExistingChunk: true,
                    name(module) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return `npm.${packageName.replace('@', '')}`;
                    },
                },
            },
        },
        // do not need to waste time on minification if not build for deployment
        minimize: isForDeploy,
    },
    devtool: shouldUseSourceMap ? 'source-map' : false,
    output: {
        path: paths.build,
        filename: 'static/js/[name].[chunkhash:8].js',
        chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
        publicPath: '/',
        devtoolModuleFilenameTemplate: info =>
            path
                .relative(paths.src, info.absoluteResourcePath)
                .replace(/\\/g, '/'),
    }
});