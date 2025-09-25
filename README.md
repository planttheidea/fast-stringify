# fast-stringify

A tiny, [blazing fast](#benchmarks) stringifier that safely handles circular objects.

The fastest way to stringify an object will always be the native `JSON.stringify`, but it does not support circular objects out of the box. If you need to stringify objects that have circular references, `fast-stringify` is there for you! It hsa a simple API to allow for several use-cases that `JSON.stringify` does not, and aims to be the most performant stringifier that handles circular references.

## Table of contents

- [fast-stringify](#fast-stringify)
  - [Table of contents](#table-of-contents)
  - [Usage](#usage)
    - [stringify](#stringify)
  - [Importing](#importing)
  - [Benchmarks](#benchmarks)
    - [Simple objects](#simple-objects)
    - [Complex objects](#complex-objects)
    - [Circular objects](#circular-objects)
    - [Special objects](#special-objects)
    - [Stable objects](#stable-objects)
  - [Development](#development)

## Usage

```javascript
import stringify from "fast-stringify";

const object = {
  foo: "bar",
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

### stringify

```ts
interface Options {
  circularReplacer?: (key: string, value: any, referenceKey: string) => any;
  indent?: number;
  replacer?: (key: string, value: any) => any;
  stable?: boolean;
  stabilizer?: (
    entryA: { key: string; value: any },
    entryB: { key: string; value: any },
    stabilizerOptions: { get: (key: string) => any }
  ) => any;
}

function stringify(value: any, options?: Options): string;
```

Stringifies the object passed based on the options passed. The only required value is the `value`. The additional optons passed will customize how the string is compiled. Available options:

- `replacer` => function to customize how the non-circular value is stringified (see [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) for more details)
- `indent` => number of spaces to indent the stringified object for pretty-printing (see [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) for more details)
- `circularReplacer` => function to customize how the circular value is stringified (defaults to `[ref=##]` where `##` is the `referenceKey`)
  - `referenceKey` is a dot-separated key list reflecting the nested key the object was originally declared at
- `stable` => whether to sort the keys for stability
- `stabilizer` => function to customize how the stable object is sorted (only applies when `stable` is `true`)

## Importing

```javascript
// ESM in browsers
import stringify from "fast-stringify";

// ESM in NodeJS
import stringify from "fast-stringify/mjs";

// CommonJS
const stringify = require("fast-stringify");
```

## Benchmarks

### Simple objects

**fast-stringify x 1,104,098 ops/sec ±0.65% (90 runs sampled)**
fast-json-stable-stringify x 996,823 ops/sec ±0.25% (99 runs sampled)
json-stringify-safe x 746,892 ops/sec ±0.30% (100 runs sampled)
json-stable-stringify x 707,415 ops/sec ±0.24% (99 runs sampled)
decircularize x 376,122 ops/sec ±0.18% (95 runs sampled)
json-cycle x 6,479 ops/sec ±0.16% (91 runs sampled)

### Complex objects

**fast-stringify x 197,784 ops/sec ±0.21% (97 runs sampled)**
fast-json-stable-stringify x 197,368 ops/sec ±0.15% (97 runs sampled)
json-stringify-safe x 141,750 ops/sec ±0.17% (100 runs sampled)
json-stable-stringify x 117,201 ops/sec ±0.23% (94 runs sampled)
decircularize x 61,345 ops/sec ±0.17% (97 runs sampled)
json-cycle x 1,059 ops/sec ±0.15% (88 runs sampled)

### Circular objects

**fast-stringify x 174,982 ops/sec ±0.14% (101 runs sampled)**
json-stringify-safe x 122,812 ops/sec ±0.14% (98 runs sampled)
decircularize x 54,176 ops/sec ±0.25% (96 runs sampled)
json-cycle x 987 ops/sec ±0.28% (86 runs sampled)
fast-json-stable-stringify: ERROR
json-stable-stringify: ERROR

### Special objects

**fast-stringify x 72,741 ops/sec ±0.22% (98 runs sampled)**
fast-json-stable-stringify x 54,683 ops/sec ±0.15% (101 runs sampled)
json-stringify-safe x 55,118 ops/sec ±0.31% (97 runs sampled)
json-stable-stringify x 36,669 ops/sec ±0.14% (101 runs sampled)
decircularize x 21,645 ops/sec ±0.27% (100 runs sampled)
json-cycle x 376 ops/sec ±0.18% (82 runs sampled)

### Stable objects

json-fast-stable-stringify x 818,266 ops/sec ±0.66% (95 runs sampled)
**fast-stringify x 579,210 ops/sec ±0.32% (95 runs sampled)**
json-stable-stringify x 478,709 ops/sec ±0.29% (99 runs sampled)

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
- `release` => run `release-it` for standard versions (expected to be installed globally)
- `release:beta` => run `release-it` for beta versions (expected to be installed globally)
- `release:scripts` => run `lint`, `typecheck`, `test:coverage`, and `dist` scripts
- `start` => run `dev`
- `test` => run Jest with NODE_ENV=test on all files in `__tests__` folder
- `test:coverage` => run same script as `test` with code coverage calculation
- `test:watch` => run same script as `test` but keep persistent watcher
- `typecheck` => run TypeScript types validation
