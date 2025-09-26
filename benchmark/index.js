"use strict";

const assertDeepStrictEqual = require("assert").deepStrictEqual;
const React = require("react");
const { Bench } = require("tinybench");
const sortBy = require("lodash/sortBy");

function Foo(value) {
  this.value = value;

  return this;
}

const shallowObject = {
  boolean: true,
  fn() {
    return "foo";
  },
  nan: NaN,
  nil: null,
  number: 123,
  string: "foo",
  undef: undefined,
  [Symbol("key")]: "value",
};

const deepObject = Object.assign({}, shallowObject, {
  array: ["foo", { bar: "baz" }],
  buffer: Buffer.from("this is a test buffer"),
  error: new Error("boom"),
  foo: new Foo("value"),
  map: new Map().set("foo", { bar: "baz" }),
  object: { foo: { bar: "baz" } },
  promise: Promise.resolve("foo"),
  regexp: /foo/,
  set: new Set().add("foo").add({ bar: "baz" }),
  weakmap: new WeakMap([
    [{}, "foo"],
    [{}, "bar"],
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

const stableObject = {
  c: 8,
  b: [{ z: 7, y: 6, x: 4, v: 2, "!v": 3 }, 7],
  a: 3,
};

const specialObject = Object.assign({}, deepObject, {
  react: React.createElement("main", {
    children: [
      React.createElement("h1", { children: "Title" }),
      React.createElement("p", { children: "Content" }),
      React.createElement("p", { children: "Content" }),
      React.createElement("p", { children: "Content" }),
      React.createElement("p", { children: "Content" }),
      React.createElement("div", {
        children: [
          React.createElement("div", {
            children: "Item",
            style: { flex: "1 1 auto" },
          }),
          React.createElement("div", {
            children: "Item",
            style: { flex: "1 1 0" },
          }),
        ],
        style: { display: "flex" },
      }),
    ],
  }),
});

circularObject.deeply.nested.reference = circularObject;

const packages = {
  decircularize: (value) => JSON.stringify(require("decircularize")(value)),
  "fast-json-stable-stringify": require("fast-json-stable-stringify"),
  "fast-stringify": require("../dist/index.cjs"),
  "json-cycle": (value) => JSON.stringify(require("json-cycle").decycle(value)),
  "json-stable-stringify": require("json-stable-stringify"),
  "json-stringify-safe": require("json-stringify-safe"),
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
  console.log("");
  console.log(`${name} (${description}):`);

  await benchmark.run();

  const sortedTasks = sortBy(benchmark.tasks, ({ result }) => result.mean);
  const taskResults = sortedTasks.reduce((results, { name, result }, index) => {
    if (result.error) {
      console.warn(
        "\x1b[33m%s\x1b[0m",
        `FAILED: ${name} ("${result.error.message}")`
      );

      return results;
    }

    results[name] = {
      "Ops/sec": Math.floor(+result.hz),
      "Margin of error": `\xb1 ${result.throughput.rme.toFixed(2)}%`,
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
    description: "small number of properties where all values are primitives",
    name: "Simple objects",
    object: shallowObject,
  },
  {
    description:
      "large number of properties where values are a combination of primitives and complex objects",
    name: "Complex objects",
    object: deepObject,
  },
  {
    description: "objects that deeply reference themselves",
    name: "Circular objects",
    object: circularObject,
  },
  {
    description: "custom constructors, react components, etc.",
    name: "Objects with special values",
    object: specialObject,
  },
  {
    description: "objects ensuring stability of keys",
    ignoredPackages: ["decircularize", "json-cycle", "json-stringify-safe"],
    name: "Stable objects",
    object: stableObject,
    runner: (name, object, fn) => {
      if (name === "fast-stringify") {
        return () => fn(object, { stable: true });
      }

      return () => fn(object);
    },
  },
].forEach(({ description, ignoredPackages, name, object, runner }) => {
  addToBenchmarks(
    name,
    description,
    getBenchmarkRunners({ ignoredPackages, object, runner })
  );
});

runSuites();
