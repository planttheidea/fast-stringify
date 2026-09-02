# fast-stringify

A tiny, [blazing fast](#benchmarks) stringifier that safely handles circular objects.

The fastest way to stringify an object will always be the native `JSON.stringify`, but it does not support circular
objects out of the box. If you need to stringify objects that have circular references, `fast-stringify` is there for
you! It has a simple API to allow for several use-cases that `JSON.stringify` does not while also maintaining blazing
fast performance compared to its peers.

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
    - [Stable circular objects](#stable-circular-objects)

## Usage

```javascript
import { stringify } from 'fast-stringify';

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

### stringify

```ts
interface Options {
  circularReplacer?: (key: string, value: any, referenceKey: string) => any;
  indent?: number | string;
  replacer?: (key: string, value: any) => any;
  stable?: boolean;
  stabilizer?: (
    entryA: { key: string; value: any },
    entryB: { key: string; value: any },
    stabilizerOptions: { get: (key: string) => any },
  ) => any;
}

function stringify(value: undefined | symbol | ((...args: any[]) => any), options?: Options): undefined;
function stringify<Value>(value: Value, options?: Options): string;
```

Stringifies the object passed based on the options passed. The only required value is the `value`. The additional optons
passed will customize how the string is compiled. Available options:

- `replacer` => function to customize how the non-circular value is stringified (see
  [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
  for more details)
- `indent` => white space used to indent the stringified object for pretty-printing, either as a number of spaces or as
  the literal string to indent with (see
  [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
  for more details)
- `circularReplacer` => function to customize how the circular value is stringified (defaults to `[ref=##]` where `##`
  is the `referenceKey`)
  - `referenceKey` is a dot-separated key list reflecting the nested key the object was originally declared at
- `stable` => whether to sort the keys for stability
  - keys are sorted in ascending order by UTF-16 code unit, matching the default `Array.prototype.sort` ordering.
    Locale-aware comparison is deliberately not used, because it would make output vary between environments.
- `stabilizer` => function to customize how the stable object is sorted (only applies when `stable` is `true`)

`stringify` returns `undefined` rather than a string when `value` itself is not serializable, which is the case for
`undefined`, functions, and symbols. Non-serializable values _nested_ within `value` always produce a string: keys on
objects are omitted, and entries in arrays become `null`.

## Importing

```javascript
// ESM
import { stringify } from 'fast-stringify';

// CommonJS
const { stringify } = require('fast-stringify');
```

## Benchmarks

### Simple objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 1305483 │ '± 0.01%'       │
│ faster-stable-stringify    │ 1070663 │ '± 0.03%'       │
│ fast-json-stable-stringify │ 1005025 │ '± 0.03%'       │
│ json-stringify-safe        │ 791765  │ '± 0.03%'       │
│ json-stable-stringify      │ 694444  │ '± 0.03%'       │
│ decircularize              │ 438981  │ '± 0.04%'       │
│ superjson                  │ 245459  │ '± 0.06%'       │
│ json-cycle                 │ 6406    │ '± 0.21%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Complex objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 228623  │ '± 0.03%'       │
│ fast-json-stable-stringify │ 190657  │ '± 0.06%'       │
│ faster-stable-stringify    │ 174003  │ '± 0.06%'       │
│ json-stringify-safe        │ 143698  │ '± 0.06%'       │
│ json-stable-stringify      │ 113430  │ '± 0.07%'       │
│ decircularize              │ 60474   │ '± 0.10%'       │
│ superjson                  │ 42793   │ '± 0.10%'       │
│ json-cycle                 │ 1075    │ '± 0.22%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 183519  │ '± 0.04%'       │
│ fast-json-stable-stringify │ 156372  │ '± 0.07%'       │
│ faster-stable-stringify    │ 150852  │ '± 0.06%'       │
│ json-stringify-safe        │ 121862  │ '± 0.07%'       │
│ json-stable-stringify      │ 102092  │ '± 0.07%'       │
│ decircularize              │ 54803   │ '± 0.09%'       │
│ superjson                  │ 33370   │ '± 0.14%'       │
│ json-cycle                 │ 1008    │ '± 0.20%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Special objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 76988   │ '± 0.08%'       │
│ json-stringify-safe        │ 53795   │ '± 0.08%'       │
│ fast-json-stable-stringify │ 50691   │ '± 0.12%'       │
│ faster-stable-stringify    │ 46390   │ '± 0.11%'       │
│ json-stable-stringify      │ 33267   │ '± 0.15%'       │
│ decircularize              │ 20694   │ '± 0.17%'       │
│ superjson                  │ 14490   │ '± 0.18%'       │
│ json-cycle                 │ 365     │ '± 0.32%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Stable objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 696864  │ '± 0.03%'       │
│ faster-stable-stringify    │ 678426  │ '± 0.04%'       │
│ fast-stringify             │ 580383  │ '± 0.03%'       │
│ json-stable-stringify      │ 405679  │ '± 0.05%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-json-stable-stringify".
```

### Stable circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ faster-stable-stringify    │ 502008  │ '± 0.04%'       │
│ fast-json-stable-stringify │ 496770  │ '± 0.04%'       │
│ fast-stringify             │ 412541  │ '± 0.04%'       │
│ json-stable-stringify      │ 311429  │ '± 0.05%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "faster-stable-stringify".
```
