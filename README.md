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

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 1039057 │ '± 0.01%'       │
│ fast-json-stable-stringify │ 904936  │ '± 0.02%'       │
│ json-stringify-safe        │ 730877  │ '± 0.02%'       │
│ json-stable-stringify      │ 679134  │ '± 0.01%'       │
│ decircularize              │ 378041  │ '± 0.02%'       │
│ json-cycle                 │ 6720    │ '± 0.05%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Complex objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 202965  │ '± 0.02%'       │
│ fast-json-stable-stringify │ 198331  │ '± 0.02%'       │
│ json-stringify-safe        │ 146527  │ '± 0.02%'       │
│ json-stable-stringify      │ 116549  │ '± 0.03%'       │
│ decircularize              │ 62209   │ '± 0.03%'       │
│ json-cycle                 │ 1130    │ '± 0.11%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 168969  │ '± 0.03%'       │
│ fast-stringify             │ 167436  │ '± 0.02%'       │
│ json-stringify-safe        │ 126559  │ '± 0.03%'       │
│ json-stable-stringify      │ 102818  │ '± 0.03%'       │
│ decircularize              │ 56722   │ '± 0.04%'       │
│ json-cycle                 │ 1051    │ '± 0.18%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-json-stable-stringify".
```

### Special objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 73502   │ '± 0.03%'       │
│ json-stringify-safe        │ 59150   │ '± 0.05%'       │
│ fast-json-stable-stringify │ 57563   │ '± 0.05%'       │
│ json-stable-stringify      │ 36883   │ '± 0.08%'       │
│ decircularize              │ 22638   │ '± 0.07%'       │
│ json-cycle                 │ 409     │ '± 0.23%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Stable objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 718969  │ '± 0.02%'       │
│ fast-stringify             │ 545528  │ '± 0.02%'       │
│ json-stable-stringify      │ 417172  │ '± 0.02%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-json-stable-stringify".
```

### Stable objects with cycles

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 477040  │ '± 0.02%'       │
│ fast-stringify             │ 381688  │ '± 0.02%'       │
│ json-stable-stringify      │ 309861  │ '± 0.02%'       │
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
