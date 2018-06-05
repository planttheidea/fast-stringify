// external dependencies
import React from 'react';

// src
import stringify from '../src';
import safeStringify from 'json-stringify-safe';

function Circular(value) {
  this.deeply = {
    nested: {
      reference: this,
      value
    }
  };
}

const StatelessComponent = () => <div>test</div>;

class StatefulComponent extends React.Component {
  state = {
    foo: 'bar'
  };

  componentDidMount() {}

  render() {
    return <StatelessComponent />;
  }
}

const a = {
  foo: 'bar'
};

const b = {
  a
};

const object = {
  arrayBuffer: new Uint16Array([1, 2, 3]).buffer,
  string: 'foo',
  date: new Date(2016, 8, 1),
  num: 12,
  bool: true,
  func() {
    alert('y');
  },
  * generator() {
    let value = yield 1;

    yield value + 2;
  },
  undef: undefined,
  nil: null,
  obj: {
    foo: 'bar'
  },
  arr: ['foo', 'bar'],
  el: document.createElement('div'),
  math: Math,
  regexp: /test/,
  circular: new Circular('foo'),
  infinity: Infinity,

  // comment out for older browser testing
  symbol: Symbol('test'),
  dataView: new DataView(new ArrayBuffer(2)),
  err: new Error('Stuff'),
  float32Array: new Float32Array([1, 2, 3]),
  float64Array: new Float64Array([1, 2, 3]),
  int16Array: new Int16Array([1, 2, 3]),
  int32Array: new Int32Array([1, 2, 3]),
  int8Array: new Int8Array([1, 2, 3]),
  map: new Map().set(true, 7).set({foo: 3}, ['abc']),
  promise: Promise.resolve(1),
  set: new Set().add('foo').add(2),
  uint16Array: new Uint16Array([1, 2, 3]),
  uint32Array: new Uint32Array([1, 2, 3]),
  uint8Array: new Uint8Array([1, 2, 3]),
  uint8ClampedArray: new Uint8ClampedArray([1, 2, 3]),
  weakMap: new WeakMap().set({}, 7).set({foo: 3}, ['abc']),
  weakSet: new WeakSet().add({}).add({foo: 'bar'}),
  doc: document,
  win: window,

  ReactStatefulClass: StatefulComponent,
  ReactStatefulElement: <StatefulComponent />,
  ReactStatelessClass: StatelessComponent,
  ReactStatelessElement: <StatelessComponent />
};

console.group('circular');
console.log(stringify(new Circular('foo')));
console.log(safeStringify(new Circular('foo')));
console.groupEnd('circular');

console.group('window');
console.log(stringify(window));
console.log(safeStringify(window));
console.groupEnd('window');

console.group('object of many types');
console.log(stringify(object, null, 2));
console.log(safeStringify(object, null, 2));
console.groupEnd('object of many types');

console.group('custom replacer');
console.log(stringify(object.arrayBuffer, (key, value) => Buffer.from(value).toString('utf8')));
console.groupEnd('custom replacer');

console.group('custom circular replacer');
console.log(stringify(new Circular('foo'), null, null, (key, value, refCount) => `Ref-${refCount}`));
console.groupEnd('custom circular replacer');

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

console.group('other object of many types');
console.log(stringify(object, null, 2));
console.log(safeStringify(object, null, 2));
console.groupEnd('other object of many types');

const shared = {bar: []};

const similar = {
  foo: shared,
  bar: shared,
  baz: {}
};

similar.baz.foo = similar.foo;
similar.baz.baz = similar.baz;

console.group('object of shared types');
console.log(stringify(similar, null, 2));
console.log(safeStringify(similar, null, 2));
console.groupEnd('object of shared types');
