/**
 * @function first
 *
 * @description
 * get the first n number of items from the array as a new array (faster than native splice)
 *
 * @param {Array<any>} array the array to get the items from
 * @param {number} length the length to limit the size to
 * @returns {Array<any>} the array limited in size
 */
export function first(array, length) {
  const newArray = new Array(length);

  for (let index = 0; index < length; index++) {
    newArray[index] = array[index];
  }

  return newArray;
}

/**
 * @function getCircularValue
 *
 * @description
 * create a method that will get a placeholder for the circular value based
 * on the value saved in the cache for it
 *
 * @param {any} _key the key of the object to stringify
 * @param {any} _value the value of the object at key
 * @param {number} refCount the index of the ref
 * @returns {string} the circular value
 */
export function getCircularValue(_key, _value, refCount) {
  return `[ref-${refCount}]`;
}

/**
 * @function indexOf
 *
 * @description
 * get the index of the value in the array (faster than native indexOf)
 *
 * @param {Array<any>} array the array to get the index of the value at
 * @param {any} value the value to match
 * @returns {number} the index of the value in array
 */
export const indexOf = (array, value) => {
  if (array[0] === value) {
    return 0;
  }

  const { length } = array;

  for (let index = 1; index < length; index++) {
    if (array[index] === value) {
      return index;
    }
  }

  return -1;
};

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
  const getCircularReplacer = circularReplacer || getCircularValue;
  const hasReplacer = typeof replacer === 'function';

  let cache = [];

  return function replace(key, value) {
    if (typeof value === 'object') {
      if (cache.length) {
        const cutoff = indexOf(cache, this) + 1;

        if (cutoff) {
          cache = first(cache, cutoff);
        } else {
          cache[cache.length] = this;
        }

        const locationOfValue = indexOf(cache, value);

        if (~locationOfValue) {
          return getCircularReplacer.call(this, key, value, locationOfValue);
        }
      } else {
        cache[0] = value;
      }
    }

    return hasReplacer ? replacer.call(this, key, value) : value;
  };
}
