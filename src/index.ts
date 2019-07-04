/**
 * @function getReferenceKey
 *
 * @description
 * get the reference key for the circular value
 *
 * @param keys the keys to build the reference key from
 * @param cutoff the maximum number of keys to include
 * @returns the reference key
 */
function getReferenceKey(keys: string[], cutoff: number) {
  return keys.slice(0, cutoff).join('.') || '.';
}

type StandardReplacer = (key: string, value: any) => any;
type CircularReplacer = (key: string, value: any, referenceKey: string) => any;

/**
 * @function createReplacer
 *
 * @description
 * create a replacer method that handles circular values
 *
 * @param [replacer] a custom replacer to use for non-circular values
 * @param [circularReplacer] a custom replacer to use for circular methods
 * @returns the value to stringify
 */
function createReplacer(
  replacer?: StandardReplacer,
  circularReplacer?: CircularReplacer,
): StandardReplacer {
  const hasReplacer = typeof replacer === 'function';
  const hasCircularReplacer = typeof circularReplacer === 'function';

  const cache = [];
  const keys = [];

  return function replace(key: string, value: any) {
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
            ? circularReplacer.call(this, key, value, getReferenceKey(keys, locationOfValue + 1))
            : `[ref=${getReferenceKey(keys, locationOfValue + 1)}]`;
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
 * @param value the value to stringify
 * @param [replacer] a custom replacer function for handling standard values
 * @param [indent] the number of spaces to indent the output by
 * @param [circularReplacer] a custom replacer function for handling circular values
 * @returns the stringified output
 */
export default function stringify(
  value: any,
  replacer?: StandardReplacer,
  indent?: number,
  circularReplacer?: CircularReplacer,
) {
  return JSON.stringify(value, createReplacer(replacer, circularReplacer), indent);
}
