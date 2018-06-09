# fast-stringify CHANGELOG

## 1.0.4

- Reduce runtime function checks

## 1.0.3

- Abandon use of `WeakSet` for caching, instead using more consistent and flexible `Array` cache with custom modifier methods

## 1.0.2

- Fix issue where directly nested objects like `window` were throwing circular errors when nested in a parent object

## 1.0.1

- Fix repeated reference issue (#2)

## 1.0.0

- Initial release
