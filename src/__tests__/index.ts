import { describe, expect, test } from 'vitest';
import * as React from 'react';

import { stringify } from '../index.js';

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
  react: React.createElement('main', {
    children: [
      React.createElement('h1', { children: 'Title' }),
      React.createElement('p', { children: 'Content' }),
      React.createElement('p', { children: 'Content' }),
      React.createElement('p', { children: 'Content' }),
      React.createElement('p', { children: 'Content' }),
      React.createElement('div', {
        children: [
          React.createElement('div', {
            children: 'Item',
            style: { flex: '1 1 auto' },
          }),
          React.createElement('div', {
            children: 'Item',
            style: { flex: '1 1 0' },
          }),
        ],
        style: { display: 'flex' },
      }),
    ],
  }),
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
