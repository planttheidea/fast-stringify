// constants
import {HAS_WEAKSET_SUPPORT} from './constants';

const create = Object.create;

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
 * @function getNewCache
 *
 * @description
 * get a new cache based on support for WeakMap or not
 *
 * @returns {WeakMap|Object} the cache
 */
export const getNewCache = () =>
  HAS_WEAKSET_SUPPORT
    ? new WeakSet()
    : create({
      _values: [],
      add(value) {
        this._values.push(value);
      },
      has(key) {
        return !!~this._values.indexOf(key);
      }
    });

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
  const cache = getNewCache();
  const getCircular = circularReplacer || getCircularValue;

  let refCount = 0,
      cacheCount = 0;

  return function customReplacer(key, value) {
    if (value && typeof value === 'object' && !(value instanceof Date || value instanceof RegExp)) {
      if (cacheCount) {
        if (this === value || cache.has(value)) {
          return getCircular.call(this, key, value, refCount++);
        }

        cache.add(this);
      } else {
        cache.add(value);
      }

      cacheCount++;
    }

    // eslint-disable-next-line eqeqeq
    return replacer == null ? value : replacer.call(this, key, value);
  };
};
