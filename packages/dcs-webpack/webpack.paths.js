'use strict';

const path = require('path');
const fs = require('fs');
const url = require('url');

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(path, needsSlash) {
    const hasSlash = path.endsWith('/');
    if (hasSlash && !needsSlash) {
        return path.substr(path, path.length - 1);
    } else if (!hasSlash && needsSlash) {
        return `${path}/`;
    } else {
        return path;
    }
}

const getPublicUrl = appPackageJson =>
    envPublicUrl || require(appPackageJson).homepage;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
    const publicUrl = getPublicUrl(appPackageJson);
    const servedUrl =
        envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');
    return ensureSlash(servedUrl, true);
}


// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
// resolve the path relatively from where we call the command
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const packageJson = require(resolveApp('package.json'));
const isPrivate = packageJson.private;

module.exports = {
    src: resolveApp('src'),
    build: resolveApp('build'),
    lib: resolveApp('lib'),
    public: isPrivate ? '' : resolveApp('public'),
    // exception for flareon
    entry: packageJson.name === 'flareon' ? resolveApp('src/index.ts') : resolveApp('src/index.tsx'),
    indexHtml: isPrivate ? '' : resolveApp('public/index.html'),
    packageJson: resolveApp('package.json'),
    tsConfig: resolveApp('tsconfig.json'),
    tsLint: path.resolve(__dirname, '../tslint.json'),
    publicUrl: isPrivate ? '' : getPublicUrl(resolveApp('package.json')),
    servedPath: isPrivate ? '' : getServedPath(resolveApp('package.json')),
    nodeModules: resolveApp('node_modules')
};