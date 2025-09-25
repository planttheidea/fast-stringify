interface StabilizerItem {
  key: string;
  value: any;
}

interface StabilizerOptions {
  /**
   * Get the value for a given key.
   */
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
   * Function to derive string value to replace circular references with.
   *
   * If not provided, circular references are replaced with `[ref=##]` where `##` is a
   * dot-separated path to the original reference (e.g. `[ref=.nested.obj]`).
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
   * Custom stabilizer function for stable key ordering when the `stable` option is set to `true`.
   *
   * If not provided, keys are sorted in ascending order using `String.prototype.localeCompare`.
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

  let sorter: ((a: any, b: any) => number) | undefined;

  if (stabilizer) {
    const options = {
      get: (key: string) => object[key],
    };

    sorter = (a, b) =>
      stabilizer(
        { key: a, value: object[a] },
        { key: b, value: object[b] },
        options
      );
  }

  const sorted = Object.keys(object).sort(sorter);
  const sortedObject: Record<string, any> = {};

  for (let index = 0; index < sorted.length; ++index) {
    const key = sorted[index]!;

    sortedObject[key] = object[key];
  }

  return sortedObject;
}

/**
 * Create a replacer method that handles circular values.
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
          const referenceKey = keys.slice(0, valueCutoff).join(".") || ".";

          return hasCircularReplacer
            ? circularReplacer.call(this, key, value, referenceKey)
            : `[ref=${referenceKey}]`;
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
 * Faster `Array.prototype.indexOf` implementation build for slicing / splicing.s
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
 * Stringifier that handles circular values.
 */
export default function stringify(
  value: any,
  options: Options = DEFAULT_OPTIONS
): string {
  return JSON.stringify(value, createReplacer(options), options.indent);
}
