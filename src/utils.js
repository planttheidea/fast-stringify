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
export const first = (array, length) => {
  const newArray = new Array(length);

  for (let index = 0; index < length; index++) {
    newArray[index] = array[index];
  }

  return newArray;
};

/**
 * @function getCircularValue
 *
 * @description
 * create a method that will get a placeholder for the circular value based
 * on the value saved in the cache for it
 *
 * @param {any} key the key of the object to stringify
 * @param {any} value the value of the object at key
 * @param {number} refCount the index of the ref
 * @returns {string} the circular value
 */
export const getCircularValue = (key, value, refCount) => `[ref-${refCount}]`;

/**
 * @function getValue
 *
 * @description
 * get the value passed (similar to an identity function)
 *
 * @param {any} key the key of the object to stringify
 * @param {any} value the value of the object at key
 * @returns {any} the value passed
 */
export const getValue = (key, value) => value;

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
  for (let index = 0; index < array.length; index++) {
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
export const createReplacer = (replacer, circularReplacer) => {
  let cache = [];

  const getCircular = circularReplacer || getCircularValue;

  return function(key, value) {
    if (cache.length) {
      const locationOfThis = indexOf(cache, this);

      if (~locationOfThis) {
        cache = first(cache, locationOfThis + 1);
      } else {
        cache[cache.length] = this;
      }

      const locationOfValue = indexOf(cache, value);

      if (~locationOfValue) {
        return getCircular.call(this, key, value, locationOfValue);
      }
    } else {
      cache[cache.length] = value;
    }

    // eslint-disable-next-line eqeqeq
    return replacer == null ? value : replacer.call(this, key, value);
  };
};
