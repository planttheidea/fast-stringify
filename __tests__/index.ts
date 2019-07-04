/* eslint-disable */

import * as React from 'react';

import stringify from '../src';
import { isMainThread } from 'worker_threads';

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
  buffer: new Buffer('this is a test buffer'),
  error: new Error('boom'),
  foo: new Foo('value'),
  map: new Map().set('foo', { bar: 'baz' }),
  object: { foo: { bar: 'baz' } },
  promise: Promise.resolve('foo'),
  regexp: /foo/,
  set: new Set().add('foo').add({ bar: 'baz' }),
  weakmap: new WeakMap([[{}, 'foo'], [{}, 'bar']]),
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
  it('should handle simple objects', () => {
    const result = stringify(simpleObject);

    expect(result).toEqual(JSON.stringify(simpleObject));
  });

  it('should handle simple objects with a custom replacer', () => {
    const replacer = (key: string, value: any) =>
      value && typeof value === 'object' ? value : `primitive-${value}`;

    const result = stringify(simpleObject, replacer);

    expect(result).toEqual(JSON.stringify(simpleObject, replacer));
  });

  it('should handle simple objects with indentation', () => {
    const result = stringify(simpleObject, null, 2);

    expect(result).toEqual(JSON.stringify(simpleObject, null, 2));
  });

  it('should handle complex objects', () => {
    const result = stringify(complexObject);

    expect(result).toEqual(JSON.stringify(complexObject));
  });

  it('should handle complex objects with a custom replacer', () => {
    const replacer = (key: string, value: any) =>
      value && typeof value === 'object' ? value : `primitive-${value}`;

    const result = stringify(complexObject, replacer);

    expect(result).toEqual(JSON.stringify(complexObject, replacer));
  });

  it('should handle circular objects', () => {
    const result = stringify(circularObject);

    expect(result).toEqual(
      JSON.stringify(
        circularObject,
        (() => {
          const cache = [];

          return (key, value) => {
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

  it('should handle circular objects with a custom circular replacer', () => {
    const result = stringify(
      circularObject,
      null,
      null,
      (key: string, value: string, referenceKey: string) => referenceKey,
    );
    const circularReplacer = (() => {
      const cache = [];

      return (key, value) => {
        if (value && typeof value === 'object' && ~cache.indexOf(value)) {
          return '.';
        }

        cache.push(value);

        return value;
      };
    })();

    expect(result).toEqual(JSON.stringify(circularObject, circularReplacer));
  });

  it('should handle special objects', () => {
    const result = stringify(specialObject);

    expect(result).toEqual(JSON.stringify(specialObject));
  });

  it('should handle special objects with a custom circular replacer', () => {
    const result = stringify(
      specialObject,
      null,
      null,
      (key: string, value: string, referenceKey: string) => referenceKey,
    );
    const circularReplacer = (() => {
      const cache = [];

      return (key: string, value: any) => {
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
