// external depedencies
import test from 'ava';
import React from 'react';

// src
import * as index from 'src/index';

function Foo(value) {
  this.value = value;

  return this;
}

const shallowObject = {
  boolean: true,
  fn() {
    return 'foo';
  },
  nan: NaN,
  nil: null,
  number: 123,
  string: 'foo',
  undef: undefined,
  [Symbol('key')]: 'value'
};

const deepObject = Object.assign({}, shallowObject, {
  array: ['foo', {bar: 'baz'}],
  buffer: new Buffer('this is a test buffer'),
  error: new Error('boom'),
  foo: new Foo('value'),
  map: new Map().set('foo', {bar: 'baz'}),
  object: {foo: {bar: 'baz'}},
  promise: Promise.resolve('foo'),
  regexp: /foo/,
  set: new Set().add('foo').add({bar: 'baz'}),
  weakmap: new WeakMap([[{}, 'foo'], [{}, 'bar']]),
  weakset: new WeakSet([{}, {}])
});

const circularObject = Object.assign({}, deepObject, {
  deeply: {
    nested: {
      reference: {}
    }
  }
});

const specialObject = Object.assign({}, deepObject, {
  react: React.createElement('main', {
    children: [
      React.createElement('h1', {children: 'Title'}),
      React.createElement('p', {children: 'Content'}),
      React.createElement('p', {children: 'Content'}),
      React.createElement('p', {children: 'Content'}),
      React.createElement('p', {children: 'Content'}),
      React.createElement('div', {
        children: [
          React.createElement('div', {
            children: 'Item',
            style: {flex: '1 1 auto'}
          }),
          React.createElement('div', {
            children: 'Item',
            style: {flex: '1 1 0'}
          })
        ],
        style: {display: 'flex'}
      })
    ]
  })
});

circularObject.deeply.nested.reference = circularObject;

test('if simple objects are handled', (t) => {
  const result = index.default(shallowObject);

  t.is(result, JSON.stringify(shallowObject));
});

test('if simple objects are handle with a custom replacer', (t) => {
  const replacer = (key, value) => (value && typeof value === 'object' ? value : `primitive-${value}`);

  const result = index.default(shallowObject, replacer);

  t.is(result, JSON.stringify(shallowObject, replacer));
});

test('if complex objects are handled', (t) => {
  const result = index.default(deepObject);

  t.is(result, JSON.stringify(deepObject));
});

test('if simple objects are handled with indentation', (t) => {
  const result = index.default(shallowObject, null, 2);

  t.is(result, JSON.stringify(shallowObject, null, 2));
});

test('if complex objects are handle with a custom replacer', (t) => {
  const replacer = (key, value) => (value && typeof value === 'object' ? value : `primitive-${value}`);

  const result = index.default(deepObject, replacer);

  t.is(result, JSON.stringify(deepObject, replacer));
});

test('if circular objects are handled', (t) => {
  const result = index.default(circularObject);

  t.is(
    result,
    JSON.stringify(
      circularObject,
      (() => {
        const cache = [];

        return (key, value) => {
          if (value && typeof value === 'object' && ~cache.indexOf(value)) {
            return `[ref-${cache.indexOf(value)}]`;
          }

          cache.push(value);

          return value;
        };
      })()
    )
  );
});

test('if circular objects are handled with a custom circular replacer', (t) => {
  const result = index.default(circularObject, null, null, (key, value, refCount) => refCount);

  t.is(
    result,
    JSON.stringify(
      circularObject,
      (() => {
        const cache = [];

        return (key, value) => {
          if (value && typeof value === 'object' && ~cache.indexOf(value)) {
            return cache.indexOf(value);
          }

          cache.push(value);

          return value;
        };
      })()
    )
  );
});

test('if special objects are handled', (t) => {
  const result = index.default(specialObject);

  t.is(
    result,
    JSON.stringify(
      specialObject,
      (() => {
        const cache = [];

        return (key, value) => {
          if (value && typeof value === 'object' && ~cache.indexOf(value)) {
            return `[ref-${cache.indexOf(value)}]`;
          }

          cache.push(value);

          return value;
        };
      })()
    )
  );
});

test('if special objects are handled with a custom circular replacer', (t) => {
  const result = index.default(specialObject, null, null, (key, value, refCount) => refCount);

  t.is(
    result,
    JSON.stringify(
      specialObject,
      (() => {
        const cache = [];

        return (key, value) => {
          if (value && typeof value === 'object' && ~cache.indexOf(value)) {
            return cache.indexOf(value);
          }

          cache.push(value);

          return value;
        };
      })()
    )
  );
});

test('if the window is handled', (t) => {
  try {
    index.default(window);

    t.pass();
  } catch (error) {
    t.fail(error);
  }
});
