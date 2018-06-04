# fast-stringify

A [blazing fast](#benchmarks) stringifier that safely handles circular objects

## Table of contents

* [Usage](#usage)
  * [stringify](#stringify)
* [Benchmarks](#benchmarks)
  * [Simple objects](#simple-objects)
  * [Complex objects](#complex-objects)
  * [Circular objects](#circular-objects)
  * [Special objects](#special-objects)
* [Development](#development)

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

* `replacer` => function to customize how the value for each key is stringified (see [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) for more details)
* `indent` => number of spaces to indent the stringified object for pretty-printing (see [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) for more details)
* `circularReplacer` => function to customize how the circular reference is stringified (defaults to `[ref-##]` where `##` is the reference count)

## Benchmarks

#### Simple objects

_Small number of properties, all values are primitives_

|                            | Operations / second | Relative margin of error |
| -------------------------- | ------------------- | ------------------------ |
| **fast-stringify**         | **633,749**         | **0.85%**                |
| fast-json-stable-stringify | 349,351             | 0.58%                    |
| json-stringify-safe        | 292,456             | 0.75%                    |
| json-stable-stringify      | 267,359             | 0.57%                    |
| json-cycle                 | 193,863             | 0.71%                    |
| decircularize              | 121,932             | 0.70%                    |

#### Complex objects

_Large number of properties, values are a combination of primitives and complex objects_

|                            | Operations / second | Relative margin of error |
| -------------------------- | ------------------- | ------------------------ |
| **fast-stringify**         | **116,155**         | **0.67%**                |
| fast-json-stable-stringify | 57,484              | 0.68%                    |
| json-cycle                 | 52,758              | 0.71%                    |
| json-stringify-safe        | 52,575              | 0.72%                    |
| json-stable-stringify      | 41,761              | 0.60%                    |
| decircularize              | 21,784              | 0.88%                    |

#### Circular objects

_Objects that deeply reference themselves_

|                                            | Operations / second | Relative margin of error |
| ------------------------------------------ | ------------------- | ------------------------ |
| **fast-stringify**                         | **105,932**         | **0.84%**                |
| json-stringify-safe                        | 49,366              | 1.07%                    |
| json-cycle                                 | 49,152              | 0.67%                    |
| decircularize                              | 20,626              | 0.81%                    |
| fast-json-stable-stringify (not supported) | 0                   | 0.00%                    |
| json-stable-stringify (not supported)      | 0                   | 0.00%                    |

#### Special objects

_Custom constructors, React components, etc_

|                            | Operations / second | Relative margin of error |
| -------------------------- | ------------------- | ------------------------ |
| **fast-stringify**         | **35,391**          | **0.67%**                |
| json-cycle                 | 20,413              | 0.63%                    |
| fast-json-stable-stringify | 17,908              | 0.52%                    |
| json-stringify-safe        | 16,988              | 0.85%                    |
| json-stable-stringify      | 13,984              | 0.85%                    |
| decircularize              | 7,223               | 0.65%                    |

## Development

Standard practice, clone the repo and `npm i` to get the dependencies. The following npm scripts are available:

* benchmark => run benchmark tests against other equality libraries
* build => build dist files with `rollup`
* clean => run `clean:dist`, `clean:es`, and `clean:lib` scripts
* clean:dist => run `rimraf` on the `dist` folder
* clean:es => run `rimraf` on the `es` folder
* clean:lib => run `rimraf` on the `lib` folder
* dev => start webpack playground App
* dist => run `build` and `build:minified` scripts
* lint => run ESLint on all files in `src` folder (also runs on `dev` script)
* lint:fix => run `lint` script, but with auto-fixer
* prepublish:compile => run `lint`, `test:coverage`, `transpile:lib`, `transpile:es`, and `dist` scripts
* start => run `dev`
* test => run AVA with NODE_ENV=test on all files in `test` folder
* test:coverage => run same script as `test` with code coverage calculation via `nyc`
* test:watch => run same script as `test` but keep persistent watcher
* transpile:es => run Babel on all files in `src` folder (transpiled to `es` folder without transpilation of ES2015 export syntax)
* transpile:lib => run Babel on all files in `src` folder (transpiled to `lib` folder)
