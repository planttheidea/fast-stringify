import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import { uglify } from "rollup-plugin-uglify";

export default [
  {
    input: "src/index.js",
    output: {
      exports: "named",
      name: "fastCopy",
      file: "dist/fast-stringify.js",
      format: "umd",
      sourcemap: true
    },
    plugins: [
      resolve({
        mainFields: ['module', 'main'],
      }),
      babel({
        exclude: "node_modules/**"
      })
    ]
  },
  {
    input: "src/index.js",
    output: {
      exports: "named",
      name: "fastCopy",
      file: "dist/fast-stringify.min.js",
      format: "umd"
    },
    plugins: [
      resolve({
        mainFields: ['module', 'main'],
      }),
      babel({
        exclude: "node_modules/**"
      }),
      uglify()
    ]
  }
];
