// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.REACT_APP_ENV = 'development';
process.env.REACT_APP_LOCAL_IP = require('ip').address();

const { merge } = require('webpack-merge');
const { baseConfig, commonRules, commonPlugins, htmlPlugins } = require('./webpack.common.js');
const paths = require('./webpack.paths.js');

const projectName = require(paths.packageJson).name;
const portMapping = {
    'dcs-web': 3000
}
const PORT = portMapping[projectName] || 3000;

module.exports = merge(baseConfig, {
    mode: 'development',
    entry: [
        require.resolve('./webpack-polyfills'),
        require.resolve('react-dev-utils/webpackHotDevClient'),
        paths.entry,
    ].filter(v => !!v),
    plugins: [...commonPlugins, ...htmlPlugins],
    module: {
        rules: commonRules
    },
    devtool: 'eval-source-map',
    devServer: {
        client: {
            logging: 'info',
            overlay: true,
        },
        compress: true,
        open: true,
        static: paths.build,
        historyApiFallback: true,
        port: PORT,
        https: process.env.REACT_APP_HTTPS === 'true'
    },
    stats: {
        errorDetails: true,
    },
});