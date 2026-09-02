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

export type Stabilizer = (a: StabilizerItem, b: StabilizerItem, options: StabilizerOptions) => number;
export type Replacer = (key: string, value: any) => any;
export type CircularReplacer = (key: string, value: any, referenceKey: string) => any;

interface BaseOptions {
  /**
   * Custom replacer function for circular reference values.
   *
   * If not provided, circular references are replaced with `[ref=##]` where `##` is a
   * dot-separated path to the original reference (e.g. `[ref=.nested.obj]`).
   */
  circularReplacer?: CircularReplacer;
  /**
   * White space used when indenting, either as a number of spaces or as the literal string to
   * indent with (e.g. `'\t'`).
   */
  indent?: number | string;
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
   * If not provided, keys are sorted in ascending order by UTF-16 code unit, which is the default
   * `Array.prototype.sort` ordering. This is deliberate: locale-aware comparison would make output
   * vary between environments, which defeats the purpose of stable ordering.
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
export function stringify(value: undefined | symbol | ((...args: any[]) => any), options?: Options): undefined;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function stringify<Value>(value: Value, options?: Options): string;
export function stringify(
  value: unknown,
  { indent, replacer, circularReplacer, stable, stabilizer }: Options = DEFAULT_OPTIONS,
): string | undefined {
  // The chain of ancestors as `JSON.stringify` sees them, matched against `this`.
  const holders: any[] = [];
  // The chain of ancestors as the caller passed them, matched against incoming values. These
  // diverge from `holders` whenever the object handed back to `JSON.stringify` is not the one
  // received, which happens when `stable` sorts into a copy or a `replacer` swaps the value. When
  // neither can happen the two chains are always identical, so they are aliased to avoid the
  // bookkeeping entirely.
  const tracksSources = !!stable || !!replacer;
  const sources: any[] = tracksSources ? [] : holders;
  // The key each entry in `holders` was reached under, so that a circular value can be reported
  // as the path leading to it. Only written when an ancestor is added, since that is the only
  // time it is ever read back.
  const keys: string[] = [];

  const sortComparator = stable && stabilizer ? getSortComparator(stabilizer) : undefined;

  let pendingHolder: any;
  let pendingSource: any;
  // The key of the value most recently descended into. `JSON.stringify` walks depth first, so the
  // next object handed back is always a property of that value, which makes this the key the
  // ancestor about to be added was reached under.
  let pendingKey = '';

  return JSON.stringify(
    value,
    function replace(this: any, key: string, rawValue: any) {
      let value = rawValue;

      if (typeof value === 'object' && value !== null) {
        if (holders.length === 0) {
          if (tracksSources) {
            sources[0] = value;
          }

          keys[0] = key;
          pendingKey = key;

          if (stable && !Array.isArray(value)) {
            const sorted = sortKeys(value as object, sortComparator?.(value));

            pendingHolder = sorted;
            pendingSource = value;
            value = sorted;
          }

          // The root's entry in the chain must be whatever `JSON.stringify` actually descends
          // into, which is the value returned here.
          const rootValue = replacer ? replacer.call(this, key, value) : value;

          holders[0] = rootValue;

          return rootValue;
        }

        const thisCutoff = holders.indexOf(this) + 1;

        if (thisCutoff === 0) {
          const length = holders.length;

          holders[length] = this;
          keys[length] = pendingKey;

          if (tracksSources) {
            sources[length] = this === pendingHolder ? pendingSource : this;
          }
        } else if (thisCutoff !== holders.length) {
          holders.length = thisCutoff;

          if (tracksSources) {
            sources.length = thisCutoff;
          }
        }

        const valueCutoff = sources.indexOf(value) + 1;

        if (valueCutoff > 0) {
          const referenceKey = keys.slice(0, valueCutoff).join('.') || '.';

          return circularReplacer
            ? circularReplacer.call(this, key, value, referenceKey)
            : '[ref=' + referenceKey + ']';
        }

        pendingKey = key;

        if (stable && !Array.isArray(value)) {
          const sorted = sortKeys(value as object, sortComparator?.(value));

          pendingHolder = sorted;
          pendingSource = value;
          value = sorted;
        }
      }

      return replacer ? replacer.call(this, key, value) : value;
    },
    indent,
  );
}

function sortKeys(value: object, comparator: ((a: string, b: string) => number) | undefined) {
  const sortedKeys = Object.keys(value).sort(comparator);
  const sorted: Record<string, any> = {};

  for (let index = 0; index < sortedKeys.length; index++) {
    const sortedKey = sortedKeys[index]!;

    sorted[sortedKey] = (value as Record<string, any>)[sortedKey];
  }

  return sorted;
}

function getSortComparator(stabilizer: Stabilizer) {
  return (target: any) => {
    const options = { get: (key: string) => target[key] };

    return (a: string, b: string) => stabilizer({ key: a, value: target[a] }, { key: b, value: target[b] }, options);
  };
}
