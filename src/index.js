export function getReferenceKey(keys, cutoff) {
  return keys.slice(0, cutoff).join('.') || '.';
}

/**
 * @function createReplacer
 *
 * @description
 * create a replacer method that handles circular values
 *
 * @param {function} [replacer] a custom replacer to use for non-circular values
 * @param {function} [circularReplacer] a custom replacer to use for circular methods
 * @returns {any} the value to stringify
 */
export function createReplacer(replacer, circularReplacer) {
  const hasReplacer = typeof replacer === 'function';
  const hasCircularReplacer = typeof circularReplacer === 'function';

  let cache = [];
  let keys = [];

  return function replace(key, value) {
    if (typeof value === 'object') {
      if (cache.length) {
        const locationOfThis = cache.indexOf(this);

        if (~locationOfThis) {
          cache.splice(locationOfThis + 1);
          keys.splice(locationOfThis + 1);
        } else {
          cache.push(this);
        }

        keys.push(key);

        const locationOfValue = cache.indexOf(value);

        if (~locationOfValue) {
          return hasCircularReplacer
            ? circularReplacer.call(this, key, value, getReferenceKey(keys))
            : `[ref=${getReferenceKey(keys)}]`;
        }
      } else {
        cache[0] = value;
        keys[0] = key;
      }
    }

    return hasReplacer ? replacer.call(this, key, value) : value;
  };
}

/**
 * @function stringify
 *
 * @description
 * strinigifer that handles circular values
 *
 * @param {any} value the value to stringify
 * @param {function} [replacer] a custom replacer function for stringifying standard values
 * @param {number} [indent] the number of spaces to indent the output by
 * @param {function} [circularReplacer] a custom replacer function for stringifying circular values
 * @returns {string} the stringified output
 */
export default function stringify(value, replacer, indent, circularReplacer) {
  return JSON.stringify(value, createReplacer(replacer, circularReplacer), indent);
}
