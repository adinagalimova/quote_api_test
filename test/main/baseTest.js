const moment = require('moment-timezone');
const allureCommandline = require('allure-commandline');
const authAPI = require('../tests/API/authAPI');
const quoteAPI = require('../tests/API/quoteAPI');
const dictionaryAPI = require('../tests/API/dictionaryAPI');
const Logger = require('./utils/log/logger');
const JSONLoader = require('./utils/data/JSONLoader');

const generateAllureReport = async () => {
  Logger.log('[inf] ▶ generate allure report');
  const generation = allureCommandline(JSONLoader.configData.allureCommandlineArgs);

  return new Promise((resolve, reject) => {
    const generationTimeout = setTimeout(() => {
      reject(new Error('[err]   timeout reached while generating allure report!'));
    }, 20000);
    generation.on('exit', (exitCode) => {
      clearTimeout(generationTimeout);
      if (exitCode !== 0) {
        return reject(new Error('[err]   could not generate allure report!'));
      }
      return resolve();
    });
  });
};

exports.mochaHooks = {
  async beforeAll() {
    moment.tz.setDefault(JSONLoader.configData.timezone);
    if (JSONLoader.configData.parallel) {
      const title = this.test.parent.suites[0].tests[0].file
        .split('/').pop().split('.').reverse()
        .pop();
      Logger.log(`${title} test log:`, title);
    }

    await authAPI.setToken();
    await dictionaryAPI.setToken();
    await quoteAPI.setToken();
    await dictionaryAPI.toggleServer();
    await dictionaryAPI.toggleVerification();
  },
  async afterAll() {
    /* eslint no-unused-expressions: ["error", { "allowTernary": true }] */
    this.test.parent.suites
      .some((suite) => suite.tests.some((test) => test.state === 'failed'))
      ? Logger.log(JSONLoader.configData.failed)
      : Logger.log(JSONLoader.configData.passed);

    if (JSONLoader.configData.parallel) {
      Logger.logParallel();
      Logger.logToFileParallel();
    }

    try {
      await generateAllureReport();
    } catch (error) {
      Logger.log(error.message);
    }
  },
};
