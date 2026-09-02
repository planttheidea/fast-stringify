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
  - keys that would be ambiguous left bare, because they are empty or contain a `.`, `"`, or `\`, are quoted as JSON
    strings, so the path always identifies exactly one value:

    ```javascript
    stringify(nested); // {"x":{"y":{"z":{"back":"[ref=.x.y]"}}}}
    stringify(dotted); // {"x.y":{"z":{"back":"[ref=.\"x.y\"]"}}}
    ```
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
│ fast-stringify             │ 1385041 │ '± 0.01%'       │
│ faster-stable-stringify    │ 1036269 │ '± 0.02%'       │
│ fast-json-stable-stringify │ 1025641 │ '± 0.02%'       │
│ json-stringify-safe        │ 840336  │ '± 0.02%'       │
│ json-stable-stringify      │ 713266  │ '± 0.02%'       │
│ decircularize              │ 468823  │ '± 0.03%'       │
│ superjson                  │ 272034  │ '± 0.03%'       │
│ json-cycle                 │ 6976    │ '± 0.09%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Complex objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 227583  │ '± 0.05%'       │
│ fast-json-stable-stringify │ 193535  │ '± 0.05%'       │
│ faster-stable-stringify    │ 176553  │ '± 0.06%'       │
│ json-stringify-safe        │ 142146  │ '± 0.07%'       │
│ json-stable-stringify      │ 112246  │ '± 0.08%'       │
│ decircularize              │ 61656   │ '± 0.10%'       │
│ superjson                  │ 42057   │ '± 0.11%'       │
│ json-cycle                 │ 1038    │ '± 0.62%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 174703  │ '± 0.04%'       │
│ fast-json-stable-stringify │ 151906  │ '± 0.07%'       │
│ faster-stable-stringify    │ 143843  │ '± 0.07%'       │
│ json-stringify-safe        │ 105218  │ '± 0.11%'       │
│ json-stable-stringify      │ 87382   │ '± 0.07%'       │
│ decircularize              │ 52408   │ '± 0.10%'       │
│ superjson                  │ 30303   │ '± 0.13%'       │
│ json-cycle                 │ 972     │ '± 0.20%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Special objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-stringify             │ 81506   │ '± 0.05%'       │
│ json-stringify-safe        │ 54552   │ '± 0.09%'       │
│ fast-json-stable-stringify │ 51421   │ '± 0.10%'       │
│ faster-stable-stringify    │ 47982   │ '± 0.10%'       │
│ json-stable-stringify      │ 34450   │ '± 0.11%'       │
│ decircularize              │ 20153   │ '± 0.13%'       │
│ superjson                  │ 14992   │ '± 0.16%'       │
│ json-cycle                 │ 384     │ '± 0.11%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-stringify".
```

### Stable objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ fast-json-stable-stringify │ 699300  │ '± 0.03%'       │
│ faster-stable-stringify    │ 679347  │ '± 0.04%'       │
│ fast-stringify             │ 580383  │ '± 0.03%'       │
│ json-stable-stringify      │ 415454  │ '± 0.04%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "fast-json-stable-stringify".
```

### Stable circular objects

```bash
┌────────────────────────────┬─────────┬─────────────────┐
│ (index)                    │ Ops/sec │ Margin of error │
├────────────────────────────┼─────────┼─────────────────┤
│ faster-stable-stringify    │ 440722  │ '± 0.04%'       │
│ fast-json-stable-stringify │ 430848  │ '± 0.04%'       │
│ fast-stringify             │ 358166  │ '± 0.04%'       │
│ json-stable-stringify      │ 275938  │ '± 0.05%'       │
└────────────────────────────┴─────────┴─────────────────┘
Fastest was "faster-stable-stringify".
```
