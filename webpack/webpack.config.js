'use strict';

const path = require('path');
const webpack = require('webpack');

const statics = require('./webpackStatics');

module.exports = {
  cache: true,

  devtool: '#source-map',

  entry: [path.resolve(statics.ROOT, 'src', 'index.ts')],

  mode: 'development',

  module: {
    rules: [
      {
        enforce: 'pre',
        include: [path.resolve(statics.ROOT, 'src')],
        loader: 'eslint-loader',
        options: {
          configFile: '.eslintrc',
          failOnError: true,
          failOnWarning: false,
          fix: true,
          formatter: require('eslint-friendly-formatter'),
        },
        test: /\.(js|ts|tsx)$/,
      },
      {
        include: [path.resolve(statics.ROOT, 'DEV_ONLY'), path.resolve(statics.ROOT, 'src')],
        loader: 'babel-loader',
        test: /\.(js|ts|tsx)$/,
      },
    ],
  },

  output: {
    filename: 'fast-stringify.js',
    library: 'fastStringify',
    libraryTarget: 'umd',
    path: path.resolve(statics.ROOT, 'dist'),
    umdNamedDefine: true,
  },

  plugins: [new webpack.EnvironmentPlugin(['NODE_ENV'])],
};
