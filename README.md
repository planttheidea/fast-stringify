# fast-stringify

A [blazing fast](#benchmarks) stringifier that safely handles circular objects

## Table of contents

- [Usage](#usage)
  - [stringify](#stringify)
- [Importing](#importing)
- [Benchmarks](#benchmarks)
  - [Simple objects](#simple-objects)
  - [Complex objects](#complex-objects)
  - [Circular objects](#circular-objects)
  - [Special objects](#special-objects)
- [Development](#development)

## Usage

```javascript
import stringify from "fast-stringify";

const object = {
  foo: "bar",
  deeply: {
    recursive: {
      object: {}
    }
  }
};

object.deeply.recursive.object = object;

console.log(stringify(object));
// {"foo":"bar","deeply":{"recursive":{"object":"[ref-0]"}}}
```

#### stringify

`stringify(object: any, replacer: ?function, indent: ?number, circularReplacer: ?function): string`

Stringifies the object passed based on the parameters you pass. The only required value is the `object`. The additional parameters passed will customize how the string is compiled.

- `replacer` => function to customize how the value for each key is stringified (see [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) for more details)
- `indent` => number of spaces to indent the stringified object for pretty-printing (see [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) for more details)
- `circularReplacer` => function to customize how the circular reference is stringified (defaults to `[ref-##]` where `##` is the reference count)

## Importing

ESM in browsers:

```javascript
import stringify from "fast-stringify";
```

ESM in NodeJS:

```javascript
import stringify from "fast-stringify/mjs";
```

CommonJS:

```javascript
const stringify = require("fast-stringify").default;
```

## Benchmarks

#### Simple objects

_Small number of properties, all values are primitives_

|                            | Operations / second | Relative margin of error |
| -------------------------- | ------------------- | ------------------------ |
| **fast-stringify**         | **627,191**         | **0.83%**                |
| fast-json-stable-stringify | 358,901             | 0.87%                    |
| json-stringify-safe        | 295,582             | 0.71%                    |
| json-stable-stringify      | 270,825             | 0.77%                    |
| json-cycle                 | 200,950             | 0.81%                    |
| decircularize              | 132,202             | 1.09%                    |

#### Complex objects

_Large number of properties, values are a combination of primitives and complex objects_

|                            | Operations / second | Relative margin of error |
| -------------------------- | ------------------- | ------------------------ |
| **fast-stringify**         | **116,915**         | **0.61%**                |
| fast-json-stable-stringify | 58,603              | 0.80%                    |
| json-cycle                 | 54,115              | 0.80%                    |
| json-stringify-safe        | 53,851              | 0.71%                    |
| json-stable-stringify      | 42,827              | 1.27%                    |
| decircularize              | 23,565              | 0.86%                    |

#### Circular objects

_Objects that deeply reference themselves_

|                                            | Operations / second | Relative margin of error |
| ------------------------------------------ | ------------------- | ------------------------ |
| **fast-stringify**                         | **106,302**         | **0.74%**                |
| json-stringify-safe                        | 50,535              | 0.64%                    |
| json-cycle                                 | 50,418              | 0.89%                    |
| decircularize                              | 21,536              | 0.94%                    |
| fast-json-stable-stringify (not supported) | 0                   | 0.00%                    |
| json-stable-stringify (not supported)      | 0                   | 0.00%                    |

#### Special objects

_Custom constructors, React components, etc_

|                            | Operations / second | Relative margin of error |
| -------------------------- | ------------------- | ------------------------ |
| **fast-stringify**         | **30,971**          | **0.83%**                |
| json-cycle                 | 21,324              | 0.82%                    |
| fast-json-stable-stringify | 17,909              | 1.04%                    |
| json-stringify-safe        | 17,522              | 0.74%                    |
| json-stable-stringify      | 13,938              | 1.05%                    |
| decircularize              | 7,438               | 0.64%                    |

## Development

Standard practice, clone the repo and `npm i` to get the dependencies. The following npm scripts are available:

- benchmark => run benchmark tests against other equality libraries
- build => build dist files with `rollup`
- clean => run `clean:dist`, `clean:es`, and `clean:lib` scripts
- clean:dist => run `rimraf` on the `dist` folder
- clean:es => run `rimraf` on the `es` folder
- clean:lib => run `rimraf` on the `lib` folder
- dev => start webpack playground App
- dist => run `build` and `build:minified` scripts
- lint => run ESLint on all files in `src` folder (also runs on `dev` script)
- lint:fix => run `lint` script, but with auto-fixer
- prepublish:compile => run `lint`, `test:coverage`, `transpile:lib`, `transpile:es`, and `dist` scripts
- start => run `dev`
- test => run AVA with NODE_ENV=test on all files in `test` folder
- test:coverage => run same script as `test` with code coverage calculation via `nyc`
- test:watch => run same script as `test` but keep persistent watcher
- transpile:es => run Babel on all files in `src` folder (transpiled to `es` folder without transpilation of ES2015 export syntax)
- transpile:lib => run Babel on all files in `src` folder (transpiled to `lib` folder)
