/* eslint-disable @typescript-eslint/no-var-requires */

import ESLintWebpackPlugin from "eslint-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = 3000;

export default {
  cache: true,

  devServer: {
    host: "localhost",
    port: PORT,
  },

  devtool: "source-map",

  entry: [path.resolve(ROOT, "DEV_ONLY", "index.tsx")],

  mode: "development",

  module: {
    rules: [
      {
        include: [path.resolve(ROOT, "DEV_ONLY"), path.resolve(ROOT, "src")],
        loader: "babel-loader",
        options: {
          plugins: [
            [
              "@babel/plugin-transform-runtime",
              {
                corejs: false,
                helpers: false,
                regenerator: true,
                useESModules: true,
              },
            ],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
          ],
          presets: ["@babel/preset-react"],
        },
        test: /\.(js|ts|tsx)$/,
      },
    ],
  },

  output: {
    filename: "fast-equals.js",
    library: "fastEquals",
    libraryTarget: "umd",
    path: path.resolve(ROOT, "dist"),
    publicPath: `http://localhost:${PORT}/`,
    umdNamedDefine: true,
  },

  plugins: [
    new ESLintWebpackPlugin(),
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new HtmlWebpackPlugin(),
  ],

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
