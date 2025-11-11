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

Stringifies the object passed based on the options passed. The only required value is the `value`. The additional optons passed will customize how the string is compiled. Available options:

- `replacer` => function to customize how the non-circular value is stringified (see [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) for more details)
- `indent` => number of spaces to indent the stringified object for pretty-printing (see [the documentation for JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) for more details)
- `circularReplacer` => function to customize how the circular value is stringified (defaults to `[ref=##]` where `##` is the `referenceKey`)
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
│ fast-stringify             │ 1246981 │ '± 0.01%'       │
│ faster-stable-stringify    │ 1009331 │ '± 0.02%'       │
│ fast-json-stable-stringify │ 918643  │ '± 0.02%'       │
│ json-stringify-safe        │ 736089  │ '± 0.02%'       │
│ json-stable-stringify      │ 655688  │ '± 0.02%'       │
│ decircularize              │ 434227  │ '± 0.03%'       │
│ superjson                  │ 260614  │ '± 0.03%'       │
│ json-cycle                 │ 5930    │ '± 0.06%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Complex objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 182435  │ '± 0.04%'       │
│ fast-json-stable-stringify │ 181922  │ '± 0.03%'       │
│ faster-stable-stringify    │ 164295  │ '± 0.03%'       │
│ json-stringify-safe        │ 133740  │ '± 0.04%'       │
│ json-stable-stringify      │ 110923  │ '± 0.04%'       │
│ decircularize              │ 60097   │ '± 0.05%'       │
│ superjson                  │ 41319   │ '± 0.06%'       │
│ json-cycle                 │ 959     │ '± 0.06%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 154881  │ '± 0.04%'       │
│ fast-json-stable-stringify │ 148094  │ '± 0.04%'       │
│ faster-stable-stringify    │ 139589  │ '± 0.04%'       │
│ json-stringify-safe        │ 115500  │ '± 0.05%'       │
│ json-stable-stringify      │ 95238   │ '± 0.06%'       │
│ decircularize              │ 54071   │ '± 0.08%'       │
│ superjson                  │ 32388   │ '± 0.08%'       │
│ json-cycle                 │ 883     │ '± 0.12%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Special objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 68639   │ '± 0.06%'       │
│ json-stringify-safe        │ 52087   │ '± 0.06%'       │
│ fast-json-stable-stringify │ 51025   │ '± 0.06%'       │
│ faster-stable-stringify    │ 46096   │ '± 0.07%'       │
│ json-stable-stringify      │ 33479   │ '± 0.08%'       │
│ decircularize              │ 20333   │ '± 0.11%'       │
│ superjson                  │ 14914   │ '± 0.10%'       │
│ json-cycle                 │ 341     │ '± 0.11%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Stable objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 673986  │ '± 0.02%'       │
│ faster-stable-stringify    │ 645572  │ '± 0.03%'       │
│ fast-stringify             │ 524383  │ '± 0.02%'       │
│ json-stable-stringify      │ 398551  │ '± 0.03%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-json-stable-stringify".
```

### Stable circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 479587  │ '± 0.03%'       │
│ faster-stable-stringify    │ 477015  │ '± 0.03%'       │
│ fast-stringify             │ 380990  │ '± 0.03%'       │
│ json-stable-stringify      │ 288945  │ '± 0.03%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-json-stable-stringify".
```
