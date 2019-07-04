# fast-stringify

A tiny, [blazing fast](#benchmarks) stringifier that safely handles circular objects

## Table of contents

- [fast-stringify](#fast-stringify)
  - [Table of contents](#Table-of-contents)
  - [Summary](#Summary)
  - [Usage](#Usage)
      - [stringify](#stringify)
  - [Importing](#Importing)
  - [Benchmarks](#Benchmarks)
      - [Simple objects](#Simple-objects)
      - [Complex objects](#Complex-objects)
      - [Circular objects](#Circular-objects)
      - [Special objects](#Special-objects)
  - [Development](#Development)

## Summary

The fastest way to stringify an object will always be the native `JSON.stringify`, but it does not support circular objects out of the box. If you need to stringify objects that have circular references, `fast-stringify` is there for you! It maintains a very similar API to the native `JSON.stringify`, and aims to be the most performant stringifier that handles circular references.

## Usage

```javascript
import stringify from 'fast-stringify';

const object = {
  foo: 'bar',
  deeply: {
    recursive: {
      object: {},
    },
  },
};

object.deeply.recursive.object = object.deeply.recursive;

console.log(stringify(object));
// {"foo":"bar","deeply":{"recursive":{"object":"[ref=.deeply.recursive]"}}}
```

#### stringify

```ts
type StandardReplacer = (key: string, value: any) => any;
type CircularReplacer = (key: string, value: any, referenceKey: string) => any;

function stringify(
  value: any,
  replacer?: StandardReplacer,
  indent?: number,
  circularReplacer: CircularReplacer,
): string;
```

Stringifies the object passed based on the parameters you pass. The only required value is the `object`. The additional parameters passed will customize how the string is compiled.

- `value` => the value to stringify
- `replacer` => function to customize how the non-circular value is stringified (see [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) for more details)
- `indent` => number of spaces to indent the stringified object for pretty-printing (see [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) for more details)
- `circularReplacer` => function to customize how the circular value is stringified (defaults to `[ref=##]` where `##` is the `referenceKey`)
  - `referenceKey` is a dot-separated key list reflecting the nested key the object was originally declared at

## Importing

```javascript
// ESM in browsers
import stringify from 'fast-stringify';

// ESM in NodeJS
import stringify from 'fast-stringify/mjs';

// CommonJS
const stringify = require('fast-stringify');
```

## Benchmarks

#### Simple objects

_Small number of properties, all values are primitives_

|                            | Operations / second | Relative margin of error |
| -------------------------- | ------------------- | ------------------------ |
| **fast-stringify**         | **598,072**         | **0.59%**                |
| fast-json-stable-stringify | 339,082             | 0.86%                    |
| json-stringify-safe        | 333,447             | 0.46%                    |
| json-stable-stringify      | 255,619             | 0.71%                    |
| json-cycle                 | 194,553             | 0.60%                    |
| decircularize              | 141,821             | 1.35%                    |

#### Complex objects

_Large number of properties, values are a combination of primitives and complex objects_

|                            | Operations / second | Relative margin of error |
| -------------------------- | ------------------- | ------------------------ |
| **fast-stringify**         | **97,559**          | **0.32%**                |
| json-stringify-safe        | 59,948              | 0.44%                    |
| fast-json-stable-stringify | 57,656              | 1.14%                    |
| json-cycle                 | 51,892              | 0.59%                    |
| json-stable-stringify      | 39,180              | 1.01%                    |
| decircularize              | 27,047              | 0.84%                    |

#### Circular objects

_Objects that deeply reference themselves_

|                                            | Operations / second | Relative margin of error |
| ------------------------------------------ | ------------------- | ------------------------ |
| **fast-stringify**                         | **87,030**          | **0.51%**                |
| json-stringify-safe                        | 56,329              | 0.49%                    |
| json-cycle                                 | 48,116              | 0.77%                    |
| decircularize                              | 25,240              | 0.68%                    |
| fast-json-stable-stringify (not supported) | 0                   | 0.00%                    |
| json-stable-stringify (not supported)      | 0                   | 0.00%                    |

#### Special objects

_Custom constructors, React components, etc_

|                            | Operations / second | Relative margin of error |
| -------------------------- | ------------------- | ------------------------ |
| **fast-stringify**         | **24,250**          | **0.38%**                |
| json-stringify-safe        | 19,526              | 0.52%                    |
| json-cycle                 | 18,433              | 0.74%                    |
| fast-json-stable-stringify | 18,202              | 0.73%                    |
| json-stable-stringify      | 13,041              | 0.87%                    |
| decircularize              | 9,175               | 0.82%                    |

## Development

Standard practice, clone the repo and `npm i` to get the dependencies. The following npm scripts are available:

- `benchmark` => run benchmark tests against other equality libraries
- `build` => build dist files with `rollup`
- `clean` => run `clean:dist` and `clean:mjs` scripts
- `clean:dist` => run `rimraf` on the `dist` folder
- `clean:mjs` => run `rimraf` on the `mjs` folder
- `copy:mjs` => copy and transform the ESM file generated by `dist` to be consumable as an `.mjs` file
- `dev` => start webpack playground App
- `dist` => run `clean`, `build`, and `copy:mjs` scripts
- `lint` => run ESLint on all files in `src` folder (also runs on `dev` script)
- `lint:fix` => run `lint` script, but with auto-fixer
- `prepublishOnly` => run `lint`, `typecheck`, `test:coverage`, and `dist` scripts
- `release` => run `release-it` for standard versions (expected to be installed globally)
- `release:beta` => run `release-it` for beta versions (expected to be installed globally)
- `start` => run `dev`
- `test` => run Jest with NODE_ENV=test on all files in `__tests__` folder
- `test:coverage` => run same script as `test` with code coverage calculation
- `test:watch` => run same script as `test` but keep persistent watcher
- `typecheck` => run TypeScript types validation
