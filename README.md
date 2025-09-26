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
    - [Stable circularobjects](#stable-circular-objects)
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
│ fast-stringify             │ 1129716 │ '± 0.01%'       │
│ fast-json-stable-stringify │ 897600  │ '± 0.02%'       │
│ json-stringify-safe        │ 714530  │ '± 0.02%'       │
│ json-stable-stringify      │ 666011  │ '± 0.02%'       │
│ decircularize              │ 374814  │ '± 0.02%'       │
│ superjson                  │ 296722  │ '± 0.02%'       │
│ json-cycle                 │ 6612    │ '± 0.07%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Complex objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 205011  │ '± 0.02%'       │
│ fast-json-stable-stringify │ 193249  │ '± 0.03%'       │
│ json-stringify-safe        │ 145528  │ '± 0.03%'       │
│ json-stable-stringify      │ 116081  │ '± 0.03%'       │
│ decircularize              │ 60842   │ '± 0.04%'       │
│ superjson                  │ 47221   │ '± 0.06%'       │
│ json-cycle                 │ 1113    │ '± 0.11%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 165949  │ '± 0.03%'       │
│ fast-json-stable-stringify │ 164775  │ '± 0.03%'       │
│ json-stringify-safe        │ 124976  │ '± 0.03%'       │
│ json-stable-stringify      │ 101248  │ '± 0.04%'       │
│ decircularize              │ 54992   │ '± 0.05%'       │
│ superjson                  │ 37815   │ '± 0.07%'       │
│ json-cycle                 │ 1040    │ '± 0.15%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Special objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 81044   │ '± 0.04%'       │
│ json-stringify-safe        │ 58829   │ '± 0.05%'       │
│ fast-json-stable-stringify │ 55647   │ '± 0.05%'       │
│ json-stable-stringify      │ 36610   │ '± 0.07%'       │
│ decircularize              │ 21891   │ '± 0.09%'       │
│ superjson                  │ 16050   │ '± 0.13%'       │
│ json-cycle                 │ 401     │ '± 0.07%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Stable objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 657770  │ '± 0.02%'       │
│ fast-stringify             │ 554002  │ '± 0.02%'       │
│ json-stable-stringify      │ 426408  │ '± 0.02%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-json-stable-stringify".
```

### Stable circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 487884  │ '± 0.02%'       │
│ fast-stringify             │ 395479  │ '± 0.02%'       │
│ json-stable-stringify      │ 317215  │ '± 0.02%'       │
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
