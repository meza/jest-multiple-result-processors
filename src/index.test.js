'use strict';
const reporterA = require('reporterA');
const reporterB = require('./fixtures/reporterB.js');
const finder = require('find-package-json');
const path = require('path');

jest.mock('../package.json');
jest.mock('find-package-json');

const packageJsonProviderMock = jest.fn();
finder.mockImplementation(function () {
  return {
    next: packageJsonProviderMock
  };
});

const multiResultProcessor = require('./index');

describe('The test result processor', function () {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('gives a useful error message when no config is given', function () {
    packageJsonProviderMock.mockReturnValue({
      value: {},
      filename: path.join(__dirname, '/package.json'),
      done: true
    });

    expect(function () {
      multiResultProcessor();
    }).toThrow('No processors configured. Please add "jestTestResultProcessors" to your package.json');

  });

  it('threads the results through the configured processors', function () {

    const results = 'mock-jest-test-results';

    packageJsonProviderMock.mockReturnValueOnce({
      value: {
        jestTestResultProcessors: [
          'reporterA',
          './fixtures/reporterB'
        ]
      },
      filename: path.join(__dirname, '/package.json'),
      done: false
    });
    packageJsonProviderMock.mockReturnValueOnce({
      value: undefined,
      done: true
    });
    multiResultProcessor(results);
    expect(reporterA).toHaveBeenCalledTimes(1);
    expect(reporterA).toHaveBeenCalledWith(results);
    expect(reporterB).toHaveBeenCalledTimes(1);
    expect(reporterB).toHaveBeenCalledWith(results);
  });

  it('returns the first package.json file it finds walking up in the filesystem', function () {
    const results = 'mock-jets-test-results';

    packageJsonProviderMock.mockReturnValueOnce({
      value: {
        name: 'jest-multiple-result-processors'
      },
      filename: `${__dirname}/parentApp/myApp/node_modules/jest-multiple-results-processor/package.json`,
      done: false
    });

    packageJsonProviderMock.mockReturnValueOnce({
      value: {
        name: 'my-project',
        jestTestResultProcessors: [
          'reporterA'
        ]
      },
      filename: `${__dirname}/parentApp/myApp/package.json`,
      done: false
    });

    packageJsonProviderMock.mockReturnValueOnce({
      value: {
        name: 'my-other-project'
      },
      filename: `${__dirname}/parentApp/package.json`,
      done: true
    });

    expect(multiResultProcessor(results)).toEqual(results);
    expect(reporterA).toHaveBeenCalledTimes(1);
    expect(reporterA).toHaveBeenCalledWith(results);
    // For loop will run the increment function before evaluating the condition and exiting, which always results in an extra call to f.next()
    expect(packageJsonProviderMock).toHaveBeenCalledTimes(3);
  });

  it('returns the second package.json file it finds walking up in the filesystem if the first one doesn\'t have jestTestResultProcessors config', function () {
    const results = 'mock-jets-test-results';

    packageJsonProviderMock.mockReturnValueOnce({
      value: {
        name: 'jest-multiple-result-processors'
      },
      filename: `${__dirname}/parentApp/myApp/node_modules/jest-multiple-results-processor/package.json`,
      done: false
    });

    packageJsonProviderMock.mockReturnValueOnce({
      value: {
        name: 'my-project'
      },
      filename: `${__dirname}/parentApp/myApp/package.json`,
      done: false
    });

    packageJsonProviderMock.mockReturnValueOnce({
      value: {
        name: 'my-other-project',
        jestTestResultProcessors: [
          'reporterA'
        ]
      },
      filename: `${__dirname}/parentApp/package.json`,
      done: false
    });

    packageJsonProviderMock.mockReturnValueOnce({
      value: undefined,
      done: true
    });

    expect(multiResultProcessor(results)).toEqual(results);
    expect(reporterA).toHaveBeenCalledTimes(1);
    expect(reporterA).toHaveBeenCalledWith(results);
    // For loop will run the increment function before evaluating the condition and exiting, which always results in an extra call to f.next()
    expect(packageJsonProviderMock).toHaveBeenCalledTimes(4);
  });
});
