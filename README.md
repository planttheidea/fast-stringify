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
│ fast-stringify             │ 1242236 │ '± 0.02%'       │
│ faster-stable-stringify    │ 948766  │ '± 0.02%'       │
│ fast-json-stable-stringify │ 844594  │ '± 0.02%'       │
│ json-stringify-safe        │ 730994  │ '± 0.02%'       │
│ json-stable-stringify      │ 633713  │ '± 0.03%'       │
│ decircularize              │ 421940  │ '± 0.03%'       │
│ superjson                  │ 252270  │ '± 0.04%'       │
│ json-cycle                 │ 6128    │ '± 0.08%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Complex objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 188430  │ '± 0.04%'       │
│ fast-json-stable-stringify │ 188394  │ '± 0.04%'       │
│ faster-stable-stringify    │ 172622  │ '± 0.04%'       │
│ json-stringify-safe        │ 138946  │ '± 0.04%'       │
│ json-stable-stringify      │ 114692  │ '± 0.05%'       │
│ decircularize              │ 60808   │ '± 0.08%'       │
│ superjson                  │ 40789   │ '± 0.07%'       │
│ json-cycle                 │ 1013    │ '± 0.15%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 160926  │ '± 0.04%'       │
│ fast-json-stable-stringify │ 154559  │ '± 0.04%'       │
│ faster-stable-stringify    │ 148367  │ '± 0.04%'       │
│ json-stringify-safe        │ 119817  │ '± 0.05%'       │
│ json-stable-stringify      │ 99492   │ '± 0.05%'       │
│ decircularize              │ 54969   │ '± 0.09%'       │
│ superjson                  │ 33390   │ '± 0.08%'       │
│ json-cycle                 │ 961     │ '± 0.17%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Special objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 71828   │ '± 0.06%'       │
│ json-stringify-safe        │ 54926   │ '± 0.07%'       │
│ fast-json-stable-stringify │ 53475   │ '± 0.07%'       │
│ faster-stable-stringify    │ 48144   │ '± 0.07%'       │
│ json-stable-stringify      │ 35339   │ '± 0.09%'       │
│ decircularize              │ 21391   │ '± 0.12%'       │
│ superjson                  │ 15120   │ '± 0.12%'       │
│ json-cycle                 │ 369     │ '± 0.08%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Stable objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 650618  │ '± 0.02%'       │
│ faster-stable-stringify    │ 638162  │ '± 0.03%'       │
│ fast-stringify             │ 533333  │ '± 0.03%'       │
│ json-stable-stringify      │ 396667  │ '± 0.03%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-json-stable-stringify".
```

### Stable circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ faster-stable-stringify    │ 476644  │ '± 0.03%'       │
│ fast-json-stable-stringify │ 474158  │ '± 0.03%'       │
│ fast-stringify             │ 381533  │ '± 0.03%'       │
│ json-stable-stringify      │ 289519  │ '± 0.03%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "faster-stable-stringify".
```
