const paths = require('./webpack.paths');
const webpack = require('webpack');
const HappyPack = require('happypack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const { getClientEnvironment } = require('./webpack.env');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

const publicUrl = '';
// const projectName = require(paths.packageJson).name;
const env = getClientEnvironment(publicUrl);

const commonRules = [
    {
        test: /\.js$/i,
        use: 'source-map-loader',
        enforce: 'pre',
        include: paths.src,
    },
    {
        test: /\.tsx?$/i,
        use: 'happypack/loader?id=ts',
        exclude: /node_modules/,
    },
    {
        test: /\.scss$/i,
        use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
        ],
    },
    {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
    },
    {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
    },
    {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
    },
    {
        test: /\.(graphql|gql)$/,
        exclude: [
            paths.nodeModules,
            /node_modules/
        ],
        use: 'graphql-tag/loader'
    }
];

const commonPlugins = [
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
        process: 'process/browser',
    }),
    new webpack.DefinePlugin(env.stringified),
    new CaseSensitivePathsPlugin(),
    new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/
    }),
    new HappyPack({
        id: 'ts',
        loaders: [
            {
                path: 'ts-loader',
                query: { happyPackMode: true }
            }
        ]
    })
];

const htmlPlugins = [
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
        inject: true,
        template: paths.indexHtml,
    })
];

const prodPlugins = [
    new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: '[name].css',
        chunkFilename: '[id].css',
    }),
    new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
    })
];

module.exports = {
    baseConfig: {
        // Don't attempt to continue if there are any errors.
        bail: true,
        resolve: {
            fallback: {
                dgram: false,
                fs: false,
                net: false,
                tls: false,
                child_process: false,
                stream: require.resolve('stream-browserify'),
                timers: require.resolve('timers-browserify'),
                buffer: require.resolve('buffer')
            },
            modules: [
                paths.nodeModules,
                'node_modules',
                paths.src
            ],
            extensions: [
                '.ts',
                '.tsx',
                '.js',
                '.jsx',
                '.json'
            ],
        },
        output: {
            filename: 'static/js/[name].js',
            publicPath: '/',
            path: paths.build,
            clean: true,
            chunkFilename: 'static/js/[name].chunk.js'
        }
    },
    commonRules: commonRules,
    commonPlugins: commonPlugins,
    htmlPlugins: htmlPlugins,
    prodPlugins: prodPlugins
}