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
     * dot-separated path to the original reference (e.g. `[ref=.nested.obj]`). Keys that would be
     * ambiguous left bare, because they are empty or contain a `.`, `"`, or `\`, are quoted as JSON
     * strings (e.g. `[ref=.nested."obj.name"]`).
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
type Options = SimpleOptions | StableOptions | UnstableOptions;
/**
 * Stringifier that handles circular values.
 */
declare function stringify(value: undefined | symbol | ((...args: any[]) => any), options?: Options): undefined;
declare function stringify<Value>(value: Value, options?: Options): string;

export { stringify };
export type { CircularReplacer, Options, Replacer, Stabilizer };
