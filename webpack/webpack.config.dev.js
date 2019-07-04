'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const ROOT = path.resolve(__dirname, '..');
const PORT = 3000;

module.exports = {
  devServer: {
    contentBase: path.join(ROOT, 'dist'),
    host: 'localhost',
    inline: true,
    lazy: false,
    noInfo: false,
    port: PORT,
    quiet: false,
    stats: {
      colors: true,
      progress: true,
    },
  },

  devtool: '#source-map',

  entry: [path.resolve(ROOT, 'DEV_ONLY', 'index.tsx')],

  mode: 'development',

  module: {
    rules: [
      {
        enforce: 'pre',
        include: [path.resolve(ROOT, 'src')],
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
        include: [path.resolve(ROOT, 'DEV_ONLY'), path.resolve(ROOT, 'src')],
        loader: 'babel-loader',
        options: {
          plugins: [
            [
              '@babel/plugin-transform-runtime',
              {
                corejs: false,
                helpers: false,
                regenerator: true,
                useESModules: true
              }
            ],
            '@babel/plugin-proposal-class-properties'
          ],
          presets: ['@babel/preset-react'],
        },
        test: /\.(js|ts|tsx)$/,
      },
    ],
  },

  output: {
    filename: 'fast-stringify.js',
    library: 'fastStringify',
    libraryTarget: 'umd',
    path: path.resolve(ROOT, 'dist'),
    publicPath: `http://localhost:${PORT}/`,
    umdNamedDefine: true,
  },

  plugins: [new webpack.EnvironmentPlugin(['NODE_ENV']), new HtmlWebpackPlugin()],

  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
};
