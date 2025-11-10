// import { deepStrictEqual as assertDeepStrictEqual } from 'assert';
import React from 'react';
import { Bench } from 'tinybench';
import sortBy from 'lodash/sortBy.js';

import decircularize from 'decircularize';
import fastJsonStableStringify from 'fast-json-stable-stringify';
import { stringify as fastStringify } from '../dist/esm/index.mjs';
import jsonCycle from 'json-cycle';
import jsonStableStringify from 'json-stable-stringify';
import jsonStringifySafe from 'json-stringify-safe';
import { SuperJSON } from 'superjson';

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
  [Symbol('key')]: 'value',
};

const deepObject = Object.assign({}, shallowObject, {
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

const circularObject = Object.assign({}, deepObject, {
  deeply: {
    nested: {
      reference: {},
    },
  },
});

circularObject.deeply.nested.reference = circularObject;

const stableCircularObject = {
  c: 8,
  b: [{ z: 7, y: 6, x: 4, v: 2, '!v': 3 }, 7],
  deeply: {
    nested: {
      reference: {},
    },
  },
  a: 3,
};

stableCircularObject.deeply.nested.reference = stableCircularObject;

const stableObject = {
  c: 8,
  b: [{ z: 7, y: 6, x: 4, v: 2, '!v': 3 }, 7],
  a: 3,
};

const specialObject = Object.assign({}, deepObject, {
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

const packages = {
  decircularize: (value) => JSON.stringify(decircularize(value)),
  'fast-json-stable-stringify': fastJsonStableStringify,
  'fast-stringify': fastStringify,
  'json-cycle': (value) => JSON.stringify(jsonCycle.decycle(value)),
  'json-stable-stringify': jsonStableStringify,
  'json-stringify-safe': jsonStringifySafe,
  superjson: SuperJSON.stringify,
};

const benchmarks = {};

function addToBenchmarks(name, description, runners) {
  if (benchmarks[name]) {
    throw new ReferenceError(`Benchmark for "${name}" already exists!`);
  }

  const { benchmark } = (benchmarks[name] = {
    description,
    benchmark: new Bench({ iterations: 1000 }),
  });

  for (const packageName in runners) {
    benchmark[packageName] = benchmark.add(packageName, runners[packageName]);
  }
}

function defaultRunner(_name, object, fn) {
  return () => fn(object);
}

function getBenchmarkRunners({
  ignoredPackages = [],
  object,
  runner = defaultRunner,
}) {
  return Object.entries(packages).reduce((runners, [packageName, fn]) => {
    if (!ignoredPackages.includes(packageName)) {
      runners[packageName] = runner(packageName, object, fn);
    }

    return runners;
  }, {});
}

async function runSuite(name, { benchmark, description }) {
  console.log('');
  console.log(`${name} (${description}):`);

  await benchmark.run();

  const sortedTasks = sortBy(benchmark.tasks, ({ result }) => result.mean);
  const taskResults = sortedTasks.reduce((results, { name, result }, index) => {
    if (result.error) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        `FAILED: ${name} ("${result.error.message}")`,
      );

      return results;
    }

    results[name] = {
      'Ops/sec': Math.floor(+result.hz),
      'Margin of error': `\xb1 ${result.throughput.rme.toFixed(2)}%`,
    };

    return results;
  }, {});

  console.table(taskResults);
  console.log(`Fastest was "${sortedTasks[0].name}".`);
}

async function runSuites() {
  for (const name in benchmarks) {
    await runSuite(name, benchmarks[name]);
  }
}

[
  {
    description: 'small number of properties where all values are primitives',
    name: 'Simple objects',
    object: shallowObject,
  },
  {
    description:
      'large number of properties where values are a combination of primitives and complex objects',
    name: 'Complex objects',
    object: deepObject,
  },
  {
    description: 'objects that deeply reference themselves',
    name: 'Circular objects',
    object: circularObject,
    runner: (name, object, fn) => {
      if (
        name === 'fast-json-stable-stringify' ||
        name === 'json-stable-stringify'
      ) {
        return () => fn(object, { cycles: true });
      }

      return () => fn(object);
    },
  },
  {
    description: 'custom constructors, react components, etc.',
    name: 'Objects with special values',
    object: specialObject,
  },
  {
    description: 'objects ensuring stability of keys',
    ignoredPackages: [
      'decircularize',
      'json-cycle',
      'json-stringify-safe',
      'superjson',
    ],
    name: 'Stable objects',
    object: stableObject,
    runner: (name, object, fn) => {
      if (name === 'fast-stringify') {
        return () => fn(object, { stable: true });
      }

      return () => fn(object);
    },
  },
  {
    description: 'circular objects ensuring stability of keys',
    ignoredPackages: [
      'decircularize',
      'json-cycle',
      'json-stringify-safe',
      'superjson',
    ],
    name: 'Stable circular objects',
    object: stableCircularObject,
    runner: (name, object, fn) => {
      if (
        name === 'fast-json-stable-stringify' ||
        name === 'json-stable-stringify'
      ) {
        return () => fn(object, { cycles: true });
      }

      if (name === 'fast-stringify') {
        return () => fn(object, { stable: true });
      }

      return () => fn(object);
    },
  },
].forEach(({ description, ignoredPackages, name, object, runner }) => {
  addToBenchmarks(
    name,
    description,
    getBenchmarkRunners({ ignoredPackages, object, runner }),
  );
});

runSuites();
