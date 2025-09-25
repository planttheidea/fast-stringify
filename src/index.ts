interface StabilizerItem {
  key: string;
  value: any;
}

interface StabilizerOptions {
  get: (key: string) => any;
}

type Stabilizer = (
  a: StabilizerItem,
  b: StabilizerItem,
  options: StabilizerOptions
) => number;
type StandardReplacer = (key: string, value: any) => any;
type CircularReplacer = (key: string, value: any, referenceKey: string) => any;

interface Options {
  /**
   * String value to replace circular references with.
   */
  circularReplacer?: CircularReplacer;
  /**
   * Number of spaces to use as white space for indenting.
   */
  indent?: number;
  /**
   * Custom replacer function for standard values.
   */
  replacer?: StandardReplacer;
  /**
   * If true, stable key ordering is used.
   */
  stable?: boolean;
  /**
   * Custom stabilizer function for stable key ordering.
   *
   * @NOTE
   * Only used if `stable` is true.
   */
  stabilizer?: Stabilizer;
}

const DEFAULT_OPTIONS: Options = {};

function getStableObject(object: any, stabilizer: Stabilizer | undefined) {
  if (object == null || typeof object !== "object") {
    return object;
  }

  const Constructor = object.constructor;

  if (
    // Created via `Object.create(null)`
    Constructor != null &&
    // Plain old JavaScript object
    Constructor !== Object &&
    // Other type of global object (Array, Date, Map, etc.)
    globalThis[Constructor.name as keyof typeof globalThis] != null
  ) {
    // Only sort plain objects.s
    return object;
  }

  let sorted: string[];

  if (stabilizer) {
    const options = {
      get: (key: string) => object[key],
    };

    sorted = Object.keys(object).sort((a, b) =>
      stabilizer(
        { key: a, value: object[a] },
        { key: b, value: object[b] },
        options
      )
    );
  } else {
    sorted = Object.keys(object).sort((a, b) => a.localeCompare(b));
  }

  return sorted.reduce((acc, key) => {
    acc[key] = object[key];

    return acc;
  }, {} as any);
}

/**
 * create a replacer method that handles circular values
 *
 * @param [replacer] a custom replacer to use for non-circular values
 * @param [circularReplacer] a custom replacer to use for circular methods
 * @returns the value to stringify
 */
function createReplacer({
  replacer,
  circularReplacer,
  stable,
  stabilizer,
}: Options): StandardReplacer {
  const hasReplacer = typeof replacer === "function";
  const hasCircularReplacer = typeof circularReplacer === "function";

  const cache: any[] = [];
  const keys: any[] = [];

  return function replace(this: any, key: string, rawValue: any) {
    let value = rawValue;

    if (typeof value === "object") {
      if (cache.length) {
        const thisCutoff = getCutoff(cache, this);

        if (thisCutoff === 0) {
          cache[cache.length] = this;
        } else {
          cache.splice(thisCutoff);
          keys.splice(thisCutoff);
        }

        keys[keys.length] = key;

        const valueCutoff = getCutoff(cache, value);

        if (valueCutoff !== 0) {
          return hasCircularReplacer
            ? circularReplacer.call(
                this,
                key,
                value,
                getReferenceKey(keys, valueCutoff)
              )
            : `[ref=${getReferenceKey(keys, valueCutoff)}]`;
        }
      } else {
        cache[0] = value;
        keys[0] = key;
      }

      if (stable) {
        value = getStableObject(value, stabilizer);
      }
    }

    return hasReplacer ? replacer.call(this, key, value) : value;
  };
}

/**
 * get the reference key for the circular value
 *
 * @param keys the keys to build the reference key from
 * @param cutoff the maximum number of keys to include
 * @returns the reference key
 */
function getReferenceKey(keys: string[], cutoff: number) {
  return keys.slice(0, cutoff).join(".") || ".";
}

/**
 * faster `Array.prototype.indexOf` implementation build for slicing / splicing
 *
 * @param array the array to match the value in
 * @param value the value to match
 * @returns the matching index, or -1
 */
function getCutoff(array: any[], value: any) {
  const { length } = array;

  for (let index = 0; index < length; ++index) {
    if (array[index] === value) {
      return index + 1;
    }
  }

  return 0;
}

/**
 * strinigifer that handles circular values
 *
 * @param the value to stringify
 * @param [replacer] a custom replacer function for handling standard values
 * @param [indent] the number of spaces to indent the output by
 * @param [circularReplacer] a custom replacer function for handling circular values
 * @returns the stringified output
 */
export default function stringify(
  value: any,
  options: Options = DEFAULT_OPTIONS
) {
  return JSON.stringify(value, createReplacer(options), options.indent);
}
