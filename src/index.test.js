'use strict';

const reporterA = require('reporterA');
const reporterB = require('reporterB');
const finder = require('find-package-json');

jest.mock('../package.json');
jest.mock('find-package-json');

const packageJsonProviderMock = jest.fn();
finder.mockImplementation(function () {
  return {
    next: packageJsonProviderMock
  }
});

const multiResultProcessor = require('./index');

describe('The test result processor', function () {

  afterEach(packageJsonProviderMock.mockReset);

  it('gives a useful error message when no config is given', function () {
    packageJsonProviderMock.mockReturnValue({
      value: {}
    });

    expect(function () {
      multiResultProcessor()
    }).toThrow("No processors configured. Please add \"jestTestResultProcessors\" to your package.json")

  });

  it('threads the results through the configured processors', function () {

    const results = jest.fn();

    packageJsonProviderMock.mockReturnValue({
      value: {
        jestTestResultProcessors: [
          'reporterA',
          'reporterB'
        ]
      }
    });
    multiResultProcessor(results);
    expect(reporterA).toHaveBeenCalledTimes(1);
    expect(reporterA).toHaveBeenCalledWith(results);
    expect(reporterB).toHaveBeenCalledTimes(1);
    expect(reporterB).toHaveBeenCalledWith(results);
  });
});
