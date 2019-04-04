'use strict';

const finder = require('find-package-json');

module.exports = function (results) {
  const f = finder(module);
  const config = f.next().value;

  if (!config.hasOwnProperty('jestTestResultProcessors')) {
    throw "No processors configured. Please add \"jestTestResultProcessors\" to your package.json";
  }

  const processors = config.jestTestResultProcessors;

  return processors.reduce(function (result, value) {
    const processor = require(value);
    return processor(result);
  }, results);
};
