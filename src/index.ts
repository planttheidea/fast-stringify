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

export type Stabilizer = (
  a: StabilizerItem,
  b: StabilizerItem,
  options: StabilizerOptions,
) => number;
export type Replacer = (key: string, value: any) => any;
export type CircularReplacer = (
  key: string,
  value: any,
  referenceKey: string,
) => any;

interface BaseOptions {
  /**
   * Custom replacer function for circular reference values.
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
  replacer?: Replacer;
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

interface SimpleOptions extends BaseOptions {
  stable?: never;
  stabilizer?: never;
}

interface UnstableOptions extends BaseOptions {
  stable: false;
  stabilizer?: never;
}

interface StableOptions extends BaseOptions {
  stable: true;
  stabilizer?: Stabilizer;
}

export type Options = SimpleOptions | StableOptions | UnstableOptions;

/**
 * Consistent reference for no options passed, to avoid garbage.
 */
const DEFAULT_OPTIONS: Options = {};

/**
 * Stringifier that handles circular values.
 */
export default function stringify<Value>(
  value: Value,
  {
    indent,
    replacer,
    circularReplacer,
    stable,
    stabilizer,
  }: Options = DEFAULT_OPTIONS,
): string {
  const cache: any[] = [];
  const keys: string[] = [];
  const getStableSorter =
    stable && stabilizer
      ? (object: any) => {
          const options = {
            get: (key: string) => object[key],
          };

          return (a: string, b: string) =>
            stabilizer(
              { key: a, value: object[a] },
              { key: b, value: object[b] },
              options,
            );
        }
      : undefined;

  return JSON.stringify(
    value,
    function replace(this: any, key: string, rawValue: any) {
      let value = rawValue;

      if (typeof value === 'object' && value !== null) {
        if (cache.length) {
          const thisCutoff = cache.indexOf(this) + 1;

          if (thisCutoff === 0) {
            cache[cache.length] = this;
          } else {
            cache.splice(thisCutoff);
            keys.splice(thisCutoff);
          }

          keys[keys.length] = key;

          const valueCutoff = cache.indexOf(value) + 1;

          if (valueCutoff > 0) {
            const referenceKey = keys.slice(0, valueCutoff).join('.') || '.';

            return circularReplacer
              ? circularReplacer.call(this, key, value, referenceKey)
              : `[ref=${referenceKey}]`;
          }
        } else {
          cache[0] = value;
          keys[0] = key;
        }

        if (stable && !Array.isArray(value)) {
          value = Object.keys(value)
            .sort(getStableSorter?.(value))
            .reduce<Record<string, any>>((sorted, key) => {
              sorted[key] = value[key];

              return sorted;
            }, {});
        }
      }

      return replacer ? replacer.call(this, key, value) : value;
    },
    indent,
  );
}
