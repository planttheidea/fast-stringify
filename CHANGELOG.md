# fast-stringify CHANGELOG

## 4.0.2

### Performance

- [#90](https://github.com/planttheidea/fast-stringify/pull/90) - Reduced per-value bookkeeping during object traversal
  by recording paths only when ancestors are added to the chain.

### Bug fixes

- [#90](https://github.com/planttheidea/fast-stringify/pull/90) - Fixed ambiguous reference keys for dotted and empty
  property names. Ambiguous keys are now JSON-quoted and escaped.
- [#90](https://github.com/planttheidea/fast-stringify/pull/90) - Fixed circular reference detection with stable,
  including cycles to nested objects. Sorted object copies are now correctly matched to their original ancestors.

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
