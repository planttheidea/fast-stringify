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

#### stringify

```ts
type StandardReplacer = (key: string, value: any) => any;
type CircularReplacer = (key: string, value: any, referenceKey: string) => any;

function stringify(
  value: any,
  replacer?: StandardReplacer,
  indent?: number,
  circularReplacer: CircularReplacer
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
│ fast-stringify             │ 1019882 │ '± 0.01%'       │
│ fast-json-stable-stringify │ 912185  │ '± 0.02%'       │
│ json-stringify-safe        │ 703476  │ '± 0.02%'       │
│ json-stable-stringify      │ 672985  │ '± 0.02%'       │
│ decircularize              │ 379974  │ '± 0.02%'       │
│ json-cycle                 │ 6760    │ '± 0.09%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".

```

### Complex objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 204278  │ '± 0.02%'       │
│ fast-json-stable-stringify │ 198841  │ '± 0.02%'       │
│ json-stringify-safe        │ 148390  │ '± 0.02%'       │
│ json-stable-stringify      │ 116298  │ '± 0.03%'       │
│ decircularize              │ 63006   │ '± 0.04%'       │
│ json-cycle                 │ 1138    │ '± 0.16%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".

```

#### Circular objects

```bash
FAILED: fast-json-stable-stringify ("Converting circular structure to JSON")
FAILED: json-stable-stringify ("Converting circular structure to JSON")
┌─────────────────────┬─────────┬─────────────────┐
│ (index)             │ Ops/sec │ Margin of error │
├─────────────────────┼─────────┼─────────────────┤
│ fast-stringify      │ 162296  │ '± 0.02%'       │
│ json-stringify-safe │ 126350  │ '± 0.02%'       │
│ decircularize       │ 57248   │ '± 0.04%'       │
│ json-cycle          │ 1066    │ '± 0.17%'       │
└─────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

#### Special objects

```bash
Objects with special values (custom constructors, react components, etc.):
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 73237   │ '± 0.04%'       │
│ json-stringify-safe        │ 58863   │ '± 0.04%'       │
│ fast-json-stable-stringify │ 56959   │ '± 0.05%'       │
│ json-stable-stringify      │ 36927   │ '± 0.07%'       │
│ decircularize              │ 22377   │ '± 0.08%'       │
│ json-cycle                 │ 403     │ '± 0.16%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
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
- `prepublishOnly` => run `lint`, `typecheck`, `test:coverage`, and `dist` scripts
- `release` => run `release-it` for standard versions (expected to be installed globally)
- `release:beta` => run `release-it` for beta versions (expected to be installed globally)
- `start` => run `dev`
- `test` => run Jest with NODE_ENV=test on all files in `__tests__` folder
- `test:coverage` => run same script as `test` with code coverage calculation
- `test:watch` => run same script as `test` but keep persistent watcher
- `typecheck` => run TypeScript types validation
