'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    popup: PATHS.src + '/popup.js',
    index: PATHS.src + '/index.js',
    background: PATHS.src + '/background.js',
  },
});

module.exports = config;
