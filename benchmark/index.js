'use strict';

const assertDeepStrictEqual = require('assert').deepStrictEqual;
const Benchmark = require('benchmark');
const React = require('react');

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

const packages = {
  decircularize: (value) => JSON.stringify(require('decircularize')(value)),
  'fast-json-stable-stringify': require('fast-json-stable-stringify'),
  'fast-stringify': require('../lib').default,
  'json-cycle': (value) => JSON.stringify(require('json-cycle').decycle(value)),
  'json-stable-stringify': require('json-stable-stringify'),
  'json-stringify-safe': require('json-stringify-safe')
};

console.log('');

const runShallowSuite = () => {
  console.log('Running shallow object performance comparison...');
  console.log('');

  const suite = new Benchmark.Suite();

  for (let name in packages) {
    suite.add(name, () => packages[name](shallowObject));
  }

  return new Promise((resolve) => {
    suite
      .on('cycle', (event) => {
        const result = event.target.toString();

        return console.log(result);
      })
      .on('complete', function() {
        console.log('');
        console.log(`...complete, the fastest is ${this.filter('fastest').map('name')}.`);

        resolve();
      })
      .run({async: true});
  });
};

const runDeepSuite = () => {
  console.log('Running deep object performance comparison...');
  console.log('');

  const suite = new Benchmark.Suite();

  for (let name in packages) {
    suite.add(name, () => packages[name](deepObject));
  }

  return new Promise((resolve) => {
    suite
      .on('cycle', (event) => {
        const result = event.target.toString();

        return console.log(result);
      })
      .on('complete', function() {
        console.log('');
        console.log(`...complete, the fastest is ${this.filter('fastest').map('name')}.`);

        resolve();
      })
      .run({async: true});
  });
};

const runCircularSuite = () => {
  console.log('Running circular object performance comparison...');
  console.log('');

  const suite = new Benchmark.Suite();

  for (let name in packages) {
    suite.add(name, () => packages[name](circularObject));
  }

  return new Promise((resolve) => {
    suite
      .on('cycle', (event) => {
        const result = event.target.toString();

        return console.log(result);
      })
      .on('complete', function() {
        console.log('');
        console.log(`...complete, the fastest is ${this.filter('fastest').map('name')}.`);

        resolve();
      })
      .run({async: true});
  });
};

const runSpecialSuite = () => {
  console.log('Running special values object performance comparison...');
  console.log('');

  const suite = new Benchmark.Suite();

  for (let name in packages) {
    suite.add(name, () => packages[name](specialObject));
  }

  return new Promise((resolve) => {
    suite
      .on('cycle', (event) => {
        const result = event.target.toString();

        return console.log(result);
      })
      .on('complete', function() {
        console.log('');
        console.log(`...complete, the fastest is ${this.filter('fastest').map('name')}.`);

        resolve();
      })
      .run({async: true});
  });
};



function consoleLogs() {
  try {
    if (!console._log) {
      hookLogs();                                           // began to hook console.log so we can process logs soon
    } else {
      printTables(unHook());                                // stop hook and print some infos as tables
    }
  } catch (e) {}
  return Promise.resolve();


  function hookLogs() {
    console._log  = console.log;
    console._logs = [];                                     // we record all the logs here until unHook was called
    console.log   = function () {
      console._log.apply(console, arguments);
      console._logs.push([].join.call(arguments, ' '));
    };
  }


  function unHook() {
    var logs    = console._logs;
    console.log = console._log;
    delete console._log;
    delete console._logs;
    return logs;
  }


  function printTables(logs) {
    splitGroup(logs).forEach(function (datas) {
      var tbody = formatTable(datas);
      console.log('\n' + datas.title + '\n');
      console.log(tbody.join('\n'));
      console.log('\n');
    });
  }


  function splitGroup(logs) {                               // match the main information from the logs and store them by group
    var groups  = [];
    var datas   = {};
    var skip    = 1;
    logs.forEach(function (item) {
      if (item.indexOf('Running ') === 0) {                 // catch logs between "Running" and "complete"
        skip    = 0;
        datas   = {};                                       // catch the follow logs to a new data
        datas.title = item.split(' ').slice(1, -1).join(' ');
        datas.rows  = [];
      } else if (item.indexOf('...complete,') === 0) {
        skip = 1;
        datas.rows.sort(function (a, b) {                   // sort by field "ops/sec", biggest first
          return (+b[1].replace(/,/g, '') || 0) - (+a[1].replace(/,/g, '') || 0);
        });
        groups.push(datas);                                 // we got a group of data where "complete" was found
      } else if (!skip && item) {
        var matchs = item.match(/^(.+?) x (.+?) ops\/sec ±(.+?%)/);
        matchs = matchs || [item, item.replace(/: $/, ' (not supported)'), ' ', ' '];
        matchs = matchs.slice(1, 4);
        datas.rows.push(matchs);                            // main information that we matched from logs by console.log
      }
    });
    return groups;
  }


  function formatTable(datas) {
    var ths   = [' ', 'Operations / second', 'Relative margin of error'];
    var lens  = [0, 0, 0];                                  // the max length of content by columns
    var tbody = [ths, ['-', '-', '-']].concat(datas.rows);  // thead for rows[0], and split lines for rows[1]
    tbody[2]  = tbody[2].map(function (td) {                // and rows[2] is the fastest one, we mark them as stronger
      return '**' + td + '**';
    });
    tbody.forEach(function (tr) {
      tr.forEach(function (td, index) {
        lens[index] = Math.max(lens[index], td.length);     // find the max length of content by columns, include the thead
      });
    });
    return tbody.map(function (tds, index) {
      var pads = index === 1 ? '-' : ' ';                   // rightPad the content by character space, for the split line we use "-"
      tds = tds.map(function (td, itd) {
        return (td + Array(lens[itd] + 1).join(pads)).slice(0, lens[itd]);
      });
      return '| ' + tds.join(' | ') + ' |';                 // we align the vertical split line by rightPad the content
    });
  }
}



consoleLogs()
  .then(runShallowSuite)
  .then(runDeepSuite)
  .then(runCircularSuite)
  .then(runSpecialSuite)
  .then(consoleLogs);

