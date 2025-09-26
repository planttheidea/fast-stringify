# fast-stringify

A tiny, [blazing fast](#benchmarks) stringifier that safely handles circular objects.

The fastest way to stringify an object will always be the native `JSON.stringify`, but it does not support circular objects out of the box. If you need to stringify objects that have circular references, `fast-stringify` is there for you! It hsa a simple API to allow for several use-cases that `JSON.stringify` does not while also maintaining blazing fast performance compared to its peers.

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

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 1155174 │ '± 0.01%'       │
│ fast-json-stable-stringify │ 924954  │ '± 0.02%'       │
│ json-stringify-safe        │ 727803  │ '± 0.01%'       │
│ json-stable-stringify      │ 672362  │ '± 0.02%'       │
│ decircularize              │ 380216  │ '± 0.02%'       │
│ json-cycle                 │ 6772    │ '± 0.06%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Complex objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 206920  │ '± 0.01%'       │
│ fast-json-stable-stringify │ 197428  │ '± 0.02%'       │
│ json-stringify-safe        │ 147598  │ '± 0.02%'       │
│ json-stable-stringify      │ 111759  │ '± 0.03%'       │
│ decircularize              │ 61649   │ '± 0.03%'       │
│ json-cycle                 │ 1133    │ '± 0.11%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 167688  │ '± 0.02%'       │
│ fast-json-stable-stringify │ 164830  │ '± 0.02%'       │
│ json-stringify-safe        │ 127448  │ '± 0.02%'       │
│ json-stable-stringify      │ 101140  │ '± 0.03%'       │
│ decircularize              │ 56804   │ '± 0.03%'       │
│ json-cycle                 │ 1067    │ '± 0.11%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Special objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 80629   │ '± 0.03%'       │
│ json-stringify-safe        │ 56903   │ '± 0.04%'       │
│ fast-json-stable-stringify │ 56565   │ '± 0.05%'       │
│ json-stable-stringify      │ 35995   │ '± 0.06%'       │
│ decircularize              │ 22315   │ '± 0.07%'       │
│ json-cycle                 │ 407     │ '± 0.11%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Stable objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 703455  │ '± 0.02%'       │
│ fast-stringify             │ 550374  │ '± 0.02%'       │
│ json-stable-stringify      │ 422065  │ '± 0.02%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-json-stable-stringify".
```

### Stable objects with cycles

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 497495  │ '± 0.02%'       │
│ fast-stringify             │ 399851  │ '± 0.02%'       │
│ json-stable-stringify      │ 312451  │ '± 0.03%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-json-stable-stringify".
```

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
