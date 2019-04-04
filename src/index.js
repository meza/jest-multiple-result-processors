'use strict';

const finder = require('find-package-json');
const path = require('path');

module.exports = function (results) {
  const f = finder(module);
  let config = {};
  let configDir = '';

  for (let nextValue = f.next(); nextValue.done !== true; nextValue = f.next()) {
    config = nextValue.value;
    configDir = path.dirname(nextValue.filename);
  }

  if (!config.hasOwnProperty('jestTestResultProcessors')) {
    throw new Error('No processors configured. Please add "jestTestResultProcessors" to your package.json');
  }

  const processors = config.jestTestResultProcessors;

  return processors.reduce(function (result, value) {
    let toRequire = value;
    if (value.charAt(0) === '.') {
      toRequire = path.resolve(configDir, value);
    }

    const processor = require(toRequire);
    return processor(result);
  }, results);
};
