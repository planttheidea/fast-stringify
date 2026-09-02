# fast-stringify CHANGELOG

## 4.0.2

### Performance

- Reduced the per-value bookkeeping done while walking the object. The key path leading to a value is now recorded only
  when an ancestor is added to the chain rather than on every value, and the root is handled outside the walk, which
  more than pays back the cost of the fix below.

### Bug fixes

- Fixed circular reference detection when the `stable` option is used. Previously only cycles pointing back at the root
  object were detected; a cycle pointing at any nested object either threw
  `RangeError: Maximum call stack size exceeded` or silently emitted the referenced object an extra time instead of a
  reference key. This happened because `stable` hands `JSON.stringify` a sorted copy of each object, so the chain of
  ancestors being tracked held copies while incoming values were the originals.

### Other changes

- `stringify` now declares an overload returning `undefined` for values that cannot be serialized on their own
  (`undefined`, functions, and symbols), which matches its runtime behavior. Values nested within an object or array are
  unaffected, and still return a string.
- `indent` now accepts a string as well as a number, matching `JSON.stringify`'s `space` argument.
- Corrected documentation of the default `stable` key ordering, which sorts by UTF-16 code unit rather than using
  `String.prototype.localeCompare`.

## 4.0.1

- [#89](https://github.com/planttheidea/fast-stringify/pull/89) - Improve closure cost for stabilizer

## 4.0.0

### BREAKING CHANGES

- `stringify` is now a named import

## 3.0.0

- [#60](https://github.com/planttheidea/fast-stringify/pull/60) - Added support for stable stringification

### BREAKING CHANGES

- Options are now all provided via object instead of parameters

## 2.0.0

- Rewritten in TypeScript
- Better reference key identification

### BREAKING CHANGES

- CommonJS builds no longer need `.default` (`const stringify = require('fast-stringify');`)
- Reference keys on circular objects now reflect the key structure leading to the object

## 1.1.2

- Update documentation to explain the purpose of the library and its relationship to `JSON.stringify`
- Add `typeof value === 'object'` check to only cache objects for faster iteration
- Improve internal `indexOf` lookup for faster cache comparisons

## 1.1.1

- Upgrade to use Babel 7 for transformations

## 1.1.0

- Add ESM support for NodeJS with separate [`.mjs` extension](https://nodejs.org/api/esm.html) exports

## 1.0.4

- Reduce runtime function checks

## 1.0.3

- Abandon use of `WeakSet` for caching, instead using more consistent and flexible `Array` cache with custom modifier
  methods

## 1.0.2

- Fix issue where directly nested objects like `window` were throwing circular errors when nested in a parent object

## 1.0.1

- Fix repeated reference issue (#2)

## 1.0.0

- Initial release
