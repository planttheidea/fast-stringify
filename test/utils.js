// test
import test from 'ava';

// src
import * as utils from 'src/utils';
import * as constants from 'src/constants';

test('if getCircularValue will return the correct default string value', (t) => {
  const key = 'foo';
  const value = 'bar';
  const refCount = 123;

  const result = utils.getCircularValue(key, value, refCount);

  t.is(result, `[ref-${refCount}]`);
});

test.serial('if getNewCache will return a new WeakSet when support is present', (t) => {
  const result = utils.getNewCache();

  t.true(result instanceof WeakSet);
});

test.serial('if getNewCache will return a new WeakSet-like object when support is not present', (t) => {
  const support = constants.HAS_WEAKSET_SUPPORT;

  constants.HAS_WEAKSET_SUPPORT = false;

  const result = utils.getNewCache();

  t.false(result instanceof WeakSet);
  t.deepEqual(result._values, []);

  const value = {foo: 'bar'};

  result.add(value);

  t.deepEqual(result._values, [value]);
  t.true(result.has(value));

  constants.HAS_WEAKSET_SUPPORT = support;
});

test('if getValue return the value passed', (t) => {
  const key = 'key';
  const value = 'value';

  const result = utils.getValue(key, value);

  t.is(result, value);
});

test('if createReplacer will create a function that handles standard values', (t) => {
  const customReplacer = undefined;
  const customCircularReplacer = undefined;

  const replacer = utils.createReplacer(customReplacer, customCircularReplacer);

  const key = 'key';
  const value = 'value';

  const result = replacer(key, value);

  t.is(result, value);
});

test('if createReplacer will create a function that handles standard values with a custom replacer', (t) => {
  const customReplacer = (key, value) => `${key}: custom-${value}`;
  const customCircularReplacer = undefined;

  const replacer = utils.createReplacer(customReplacer, customCircularReplacer);

  const key = 'key';
  const value = 'value';

  const result = replacer(key, value);

  t.is(result, `${key}: custom-${value}`);
});

test('if createReplacer will create a function that handles null values', (t) => {
  const customReplacer = undefined;
  const customCircularReplacer = undefined;

  const replacer = utils.createReplacer(customReplacer, customCircularReplacer);

  const key = 'key';
  const value = null;

  const result = replacer(key, value);

  t.is(result, value);
});

test('if createReplacer will create a function that handles non-circular object values', (t) => {
  const customReplacer = undefined;
  const customCircularReplacer = undefined;

  const replacer = utils.createReplacer(customReplacer, customCircularReplacer);

  const key = 'key';
  const value = {foo: 'bar'};

  const result = replacer(key, value);

  t.is(result, value);
});

test('if createReplacer will create a function that handles circular object values', (t) => {
  const customReplacer = undefined;
  const customCircularReplacer = undefined;

  const replacer = utils.createReplacer(customReplacer, customCircularReplacer);

  const key = 'key';
  const value = {foo: 'bar'};
  const object = {key: value};

  value.deeply = {
    circular: {
      value
    }
  };

  const result = replacer.call(object, key, value);

  t.is(result, value);

  const deeplyResult = replacer.call(object[key], 'deeply', value.deeply);

  t.is(deeplyResult, value.deeply);

  const circularResult = replacer.call(object[key].deeply, 'circular', value.deeply.circular);

  t.is(circularResult, value.deeply.circular);

  const circularValueResult = replacer.call(object[key].deeply.circular, 'value', value.deeply.circular.value);

  t.is(circularValueResult, '[ref-0]');
});

test('if createReplacer will create a function that handles circular object values with a custom circularReplacer', (t) => {
  const customReplacer = undefined;
  const customCircularReplacer = (key, value, refCount) => `custom stuff: ${refCount}`;

  const replacer = utils.createReplacer(customReplacer, customCircularReplacer);

  const key = 'key';
  const value = {foo: 'bar'};
  const object = {key: value};

  value.deeply = {
    circular: {
      value
    }
  };

  const result = replacer.call(object, key, value);

  t.is(result, value);

  const deeplyResult = replacer.call(object[key], 'deeply', value.deeply);

  t.is(deeplyResult, value.deeply);

  const circularResult = replacer.call(object[key].deeply, 'circular', value.deeply.circular);

  t.is(circularResult, value.deeply.circular);

  const circularValueResult = replacer.call(object[key].deeply.circular, 'value', value.deeply.circular.value);

  t.is(circularValueResult, `custom stuff: 0`);
});
