import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { stringify } from '../src/index.js';

class Foo {
  value: string;

  constructor(value: string) {
    this.value = value;
  }
}

const simpleObject = {
  boolean: true,
  fn() {
    return 'foo';
  },
  nan: NaN,
  nil: null,
  number: 123,
  string: 'foo',
  undef: undefined,
  [Symbol('key')]: 'value',
};

const complexObject = Object.assign({}, simpleObject, {
  array: ['foo', { bar: 'baz' }],
  buffer: Buffer.from('this is a test buffer'),
  error: new Error('boom'),
  foo: new Foo('value'),
  map: new Map().set('foo', { bar: 'baz' }),
  object: { foo: { bar: 'baz' } },
  promise: Promise.resolve('foo'),
  regexp: /foo/,
  set: new Set().add('foo').add({ bar: 'baz' }),
  weakmap: new WeakMap([
    [{}, 'foo'],
    [{}, 'bar'],
  ]),
  weakset: new WeakSet([{}, {}]),
});

const circularObject = Object.assign({}, complexObject, {
  deeply: {
    nested: {
      reference: {},
    },
  },
});

const specialObject = Object.assign({}, complexObject, {
  react: React.createElement(
    'main',
    {},
    React.createElement('h1', {}, 'Title'),
    React.createElement('p', {}, 'Content'),
    React.createElement('p', {}, 'Content'),
    React.createElement('p', {}, 'Content'),
    React.createElement('p', {}, 'Content'),
    React.createElement(
      'div',
      { style: { display: 'flex' } },
      React.createElement('div', { style: { flex: '1 1 auto' } }, 'Item'),
      React.createElement('div', { style: { flex: '1 1 0' } }, 'Item'),
    ),
  ),
});

circularObject.deeply.nested.reference = circularObject;

describe('handling of object types', () => {
  test('should handle simple objects', () => {
    const result = stringify(simpleObject);

    expect(result).toEqual(JSON.stringify(simpleObject));
  });

  test('should handle simple objects with a custom replacer', () => {
    const replacer = (_key: string, value: any) => (value && typeof value === 'object' ? value : `primitive-${value}`);

    const result = stringify(simpleObject, { replacer });

    expect(result).toEqual(JSON.stringify(simpleObject, replacer));
  });

  test('should handle simple objects with indentation', () => {
    const result = stringify(simpleObject, { indent: 2 });

    expect(result).toEqual(JSON.stringify(simpleObject, null, 2));
  });

  test('should handle complex objects', () => {
    const result = stringify(complexObject);

    expect(result).toEqual(JSON.stringify(complexObject));
  });

  test('should handle complex objects with a custom replacer', () => {
    const replacer = (_key: string, value: any) => (value && typeof value === 'object' ? value : `primitive-${value}`);

    const result = stringify(complexObject, { replacer });

    expect(result).toEqual(JSON.stringify(complexObject, replacer));
  });

  test('should handle circular objects', () => {
    const result = stringify(circularObject);

    expect(result).toEqual(
      JSON.stringify(
        circularObject,
        (() => {
          const cache: any[] = [];

          return (_key, value) => {
            if (value && typeof value === 'object' && ~cache.indexOf(value)) {
              return `[ref=.]`;
            }

            cache.push(value);

            return value;
          };
        })(),
      ),
    );
  });

  test('should handle circular objects with a custom circular replacer', () => {
    const result = stringify(circularObject, {
      circularReplacer: (_key: string, _value: string, referenceKey: string) => referenceKey,
    });
    const circularReplacer = (() => {
      const cache: any[] = [];

      return (_key: any, value: any) => {
        if (value && typeof value === 'object' && ~cache.indexOf(value)) {
          return '.';
        }

        cache.push(value);

        return value;
      };
    })();

    expect(result).toEqual(JSON.stringify(circularObject, circularReplacer));
  });

  test('should handle special objects', () => {
    const result = stringify(specialObject);

    expect(result).toEqual(JSON.stringify(specialObject));
  });

  test('should handle special objects with a custom circular replacer', () => {
    const result = stringify(specialObject, {
      circularReplacer: (_key: string, _value: string, referenceKey: string) => referenceKey,
    });
    const circularReplacer = (() => {
      const cache: any[] = [];

      return (_key: string, value: any) => {
        if (value && typeof value === 'object' && ~cache.indexOf(value)) {
          return '.';
        }

        cache.push(value);

        return value;
      };
    })();

    expect(result).toEqual(JSON.stringify(specialObject, circularReplacer));
  });
});

describe('key references', () => {
  test('should point to the top level object when it is referenced', () => {
    const object = {
      foo: 'bar',
      deeply: {
        recursive: {
          object: {},
        },
      },
    };

    object.deeply.recursive.object = object;

    expect(stringify(object)).toEqual(`{"foo":"bar","deeply":{"recursive":{"object":"[ref=.]"}}}`);
  });

  test('should point to the nested object when it is referenced', () => {
    const object = {
      foo: 'bar',
      deeply: {
        recursive: {
          object: {},
        },
      },
    };

    object.deeply.recursive.object = object.deeply.recursive;

    expect(stringify(object)).toEqual(`{"foo":"bar","deeply":{"recursive":{"object":"[ref=.deeply.recursive]"}}}`);
  });

  describe('stable keys', () => {
    test('should create consistent key orders', () => {
      const unordered = stringify({ c: 1, b: 2, a: 3 }, { stable: true });
      const ordered = stringify({ a: 3, b: 2, c: 1 }, { stable: true });

      expect(unordered).toEqual(ordered);
    });

    describe('stringification', () => {
      test('simple object', () => {
        const object = { c: 6, b: [4, 5], a: 3, z: null };

        expect(stringify(object, { stable: true })).toEqual('{"a":3,"b":[4,5],"c":6,"z":null}');
      });

      test('object with undefined', () => {
        const object = { a: 3, z: undefined };

        expect(stringify(object, { stable: true })).toEqual('{"a":3}');
      });

      test('array with undefined', () => {
        const object = [4, undefined, 6];

        expect(stringify(object, { stable: true })).toEqual('[4,null,6]');
      });

      test('object with empty string', () => {
        const object = { a: 3, z: '' };

        expect(stringify(object, { stable: true })).toEqual('{"a":3,"z":""}');
      });

      test('array with empty string', () => {
        const object = [4, '', 6];

        expect(stringify(object, { stable: true })).toEqual('[4,"",6]');
      });

      test('raw string', () => {
        const input = 'raw';

        expect(stringify(input, { stable: true })).toEqual('"raw"');
      });

      test('raw number', () => {
        const input = 42;

        expect(stringify(input, { stable: true })).toEqual('42');
      });
    });

    describe('custom comparison function', () => {
      test('should allow key comparison', () => {
        const object = { c: 8, b: [{ z: 6, y: 5, x: 4 }, 7], a: 3 };
        const stringified = stringify(object, {
          stable: true,
          stabilizer(a, b) {
            return a.key < b.key ? 1 : -1;
          },
        });

        expect(stringified).toEqual(`{"c":8,"b":[{"z":6,"y":5,"x":4},7],"a":3}`);
      });

      test('should allow comparison with get', () => {
        const obj = { c: 8, b: [{ z: 7, y: 6, x: 4, v: 2, '!v': 3 }, 7], a: 3 };
        const stringified = stringify(obj, {
          stable: true,
          stabilizer(a, b, options) {
            const get = options.get;
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            const v1 = (get(`!${a.key}`) ?? 0) + a.value;
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            const v2 = (get(`!${b.key}`) ?? 0) + b.value;
            return v1 - v2;
          },
        });

        expect(stringified).toEqual('{"c":8,"b":[{"!v":3,"x":4,"v":2,"y":6,"z":7},7],"a":3}');
      });
    });

    describe('nested references', () => {
      test('nested', () => {
        const object = { c: 8, b: [{ z: 6, y: 5, x: 4 }, 7], a: 3 };

        expect(stringify(object, { stable: true })).toEqual('{"a":3,"b":[{"x":4,"y":5,"z":6},7],"c":8}');
      });

      test('cyclic', () => {
        const one = { two: {}, a: 1 };
        const two = { one: one, a: 2 };

        one.two = two;

        expect(stringify(one, { stable: true })).toEqual('{"a":1,"two":{"a":2,"one":"[ref=.]"}}');
      });

      test('repeated non-cyclic value', () => {
        const one = { x: 1 };
        const two = { a: one, b: one };

        expect(stringify(two, { stable: true })).toEqual('{"a":{"x":1},"b":{"x":1}}');
      });

      test('acyclic but with reused obj-property pointers', () => {
        const x = { a: 1 };
        const y = { b: x, c: x };

        expect(stringify(y, { stable: true })).toEqual('{"b":{"a":1},"c":{"a":1}}');
      });
    });
  });
});

describe('circular references with stable keys', () => {
  test('should handle a cycle pointing at a nested object rather than the root', () => {
    const object: any = { x: {} };

    object.x.y = object.x;

    expect(stringify(object, { stable: true })).toEqual('{"x":{"y":"[ref=.x]"}}');
  });

  test('should handle a deeply nested cycle', () => {
    const object: any = { foo: 'bar', deeply: { recursive: { object: {} } } };

    object.deeply.recursive.object = object.deeply.recursive;

    expect(stringify(object, { stable: true })).toEqual(
      '{"deeply":{"recursive":{"object":"[ref=.deeply.recursive]"}},"foo":"bar"}',
    );
  });

  test('should handle a cycle several levels above the reference', () => {
    const object: any = { a: { b: { c: {} } } };

    object.a.b.c.back = object.a.b;

    expect(stringify(object, { stable: true })).toEqual('{"a":{"b":{"c":{"back":"[ref=.a.b]"}}}}');
  });

  test('should resolve sibling cycles to their own paths', () => {
    const self: any = {};

    self.me = self;

    expect(stringify({ p: self, q: self }, { stable: true })).toEqual('{"p":{"me":"[ref=.p]"},"q":{"me":"[ref=.q]"}}');
  });

  test('should handle cyclic values held in an array', () => {
    const self: any = { n: 1 };

    self.self = self;

    expect(stringify({ list: [self, self] }, { stable: true })).toEqual(
      '{"list":[{"n":1,"self":"[ref=.list.0]"},{"n":1,"self":"[ref=.list.1]"}]}',
    );
  });

  test('should produce the same reference keys as the unstable equivalent', () => {
    const build = () => {
      const object: any = { b: { c: {} }, a: 1 };

      object.b.c.up = object.b;

      return object;
    };

    expect(stringify(build(), { stable: true })).toEqual('{"a":1,"b":{"c":{"up":"[ref=.b]"}}}');
    expect(stringify(build())).toEqual('{"b":{"c":{"up":"[ref=.b]"}},"a":1}');
  });

  test('should support a custom circular replacer', () => {
    const object: any = { x: {} };

    object.x.y = object.x;

    expect(
      stringify(object, {
        stable: true,
        circularReplacer: (_key: string, _value: any, referenceKey: string) => referenceKey,
      }),
    ).toEqual('{"x":{"y":".x"}}');
  });
});

describe('non-serializable values', () => {
  test('should return undefined when the value itself is not serializable', () => {
    /* eslint-disable @typescript-eslint/no-confusing-void-expression -- the annotations are the
       assertion; `npm run typecheck` fails if the overloads regress. */
    const undefinedResult: undefined = stringify(undefined);
    const functionResult: undefined = stringify(() => undefined);
    const symbolResult: undefined = stringify(Symbol('key'));
    /* eslint-enable @typescript-eslint/no-confusing-void-expression */
    const stringResult: string = stringify({ a: 1 });

    expect(undefinedResult).toBeUndefined();
    expect(functionResult).toBeUndefined();
    expect(symbolResult).toBeUndefined();
    expect(stringResult).toEqual('{"a":1}');
  });

  test('should omit non-serializable object properties', () => {
    expect(stringify({ a: 1, b: undefined, c: () => undefined, d: Symbol('key') })).toEqual('{"a":1}');
  });

  test('should convert non-serializable array entries to null', () => {
    expect(stringify([1, undefined, () => undefined, 4])).toEqual('[1,null,null,4]');
  });
});

describe('indentation', () => {
  test('should support a string indent', () => {
    expect(stringify({ a: 1 }, { indent: '\t' })).toEqual(JSON.stringify({ a: 1 }, null, '\t'));
  });
});
