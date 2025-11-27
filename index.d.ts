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
type Stabilizer = (a: StabilizerItem, b: StabilizerItem, options: StabilizerOptions) => number;
type Replacer = (key: string, value: any) => any;
type CircularReplacer = (key: string, value: any, referenceKey: string) => any;
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
type Options = SimpleOptions | StableOptions | UnstableOptions;
/**
 * Stringifier that handles circular values.
 */
declare function stringify<Value>(
  value: Value,
  { indent, replacer, circularReplacer, stable, stabilizer }?: Options,
): string;

export { stringify };
export type { CircularReplacer, Options, Replacer, Stabilizer };
