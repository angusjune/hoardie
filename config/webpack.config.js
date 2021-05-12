'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    index: PATHS.src + '/index.js',
    background: PATHS.src + '/background.js',
    app: PATHS.src + '/App.svelte',
    utils: PATHS.src + '/utils.js',
  },
});

module.exports = config;
