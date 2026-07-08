# fast-stringify

A tiny, [blazing fast](#benchmarks) stringifier that safely handles circular objects.

The fastest way to stringify an object will always be the native `JSON.stringify`, but it does not support circular
objects out of the box. If you need to stringify objects that have circular references, `fast-stringify` is there for
you! It hsa a simple API to allow for several use-cases that `JSON.stringify` does not while also maintaining blazing
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
  indent?: number;
  replacer?: (key: string, value: any) => any;
  stable?: boolean;
  stabilizer?: (
    entryA: { key: string; value: any },
    entryB: { key: string; value: any },
    stabilizerOptions: { get: (key: string) => any },
  ) => any;
}

function stringify(value: any, options?: Options): string;
```

Stringifies the object passed based on the options passed. The only required value is the `value`. The additional optons
passed will customize how the string is compiled. Available options:

- `replacer` => function to customize how the non-circular value is stringified (see
  [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
  for more details)
- `indent` => number of spaces to indent the stringified object for pretty-printing (see
  [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
  for more details)
- `circularReplacer` => function to customize how the circular value is stringified (defaults to `[ref=##]` where `##`
  is the `referenceKey`)
  - `referenceKey` is a dot-separated key list reflecting the nested key the object was originally declared at
- `stable` => whether to sort the keys for stability
- `stabilizer` => function to customize how the stable object is sorted (only applies when `stable` is `true`)

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
│ fast-stringify             │ 1369863 │ '± 0.01%'       │
│ faster-stable-stringify    │ 1004016 │ '± 0.02%'       │
│ fast-json-stable-stringify │ 908265  │ '± 0.02%'       │
│ json-stringify-safe        │ 754147  │ '± 0.02%'       │
│ json-stable-stringify      │ 656167  │ '± 0.02%'       │
│ decircularize              │ 459981  │ '± 0.03%'       │
│ superjson                  │ 266311  │ '± 0.03%'       │
│ json-cycle                 │ 6613    │ '± 0.11%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Complex objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 203873  │ '± 0.03%'       │
│ fast-json-stable-stringify │ 192012  │ '± 0.03%'       │
│ faster-stable-stringify    │ 178094  │ '± 0.03%'       │
│ json-stringify-safe        │ 144341  │ '± 0.03%'       │
│ json-stable-stringify      │ 116090  │ '± 0.04%'       │
│ decircularize              │ 62593   │ '± 0.06%'       │
│ superjson                  │ 41663   │ '± 0.06%'       │
│ json-cycle                 │ 1096    │ '± 0.13%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 167056  │ '± 0.02%'       │
│ fast-json-stable-stringify │ 165207  │ '± 0.04%'       │
│ faster-stable-stringify    │ 152811  │ '± 0.04%'       │
│ json-stringify-safe        │ 125000  │ '± 0.03%'       │
│ json-stable-stringify      │ 102186  │ '± 0.05%'       │
│ decircularize              │ 56053   │ '± 0.06%'       │
│ superjson                  │ 33646   │ '± 0.07%'       │
│ json-cycle                 │ 1007    │ '± 0.19%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Special objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 78149   │ '± 0.04%'       │
│ json-stringify-safe        │ 56811   │ '± 0.05%'       │
│ fast-json-stable-stringify │ 54887   │ '± 0.06%'       │
│ faster-stable-stringify    │ 49870   │ '± 0.06%'       │
│ json-stable-stringify      │ 35918   │ '± 0.07%'       │
│ decircularize              │ 22035   │ '± 0.08%'       │
│ superjson                  │ 15173   │ '± 0.11%'       │
│ json-cycle                 │ 389     │ '± 0.14%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Stable objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 724112  │ '± 0.02%'       │
│ faster-stable-stringify    │ 704225  │ '± 0.03%'       │
│ fast-stringify             │ 576368  │ '± 0.02%'       │
│ json-stable-stringify      │ 426075  │ '± 0.03%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-json-stable-stringify".
```

### Stable circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 498256  │ '± 0.03%'       │
│ faster-stable-stringify    │ 487092  │ '± 0.03%'       │
│ fast-stringify             │ 408830  │ '± 0.02%'       │
│ json-stable-stringify      │ 315159  │ '± 0.03%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-json-stable-stringify".
```
