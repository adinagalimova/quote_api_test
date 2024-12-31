const path = require('path');
const authAPI = require('./authAPI');
const BaseAPI = require('../../main/utils/API/baseAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');
require('dotenv').config({ path: path.join(__dirname, '../../../', '.env.test'), override: true });

class OnesAPI extends BaseAPI {
  #API;

  #options;

  constructor(options = {
    baseURL: '' || process.env.GATEWAY_URL,
  }) {
    super(options);
    this.#options = options;
  }

  async setToken() {
    const response = await authAPI.auth({ APIName: 'Ones API' });
    this.#options.headers = {};
    this.#options.headers.Authorization = `Bearer ${response.data.data.access_token}`;
    this.#API = new OnesAPI(this.#options);
  }

  /* eslint camelcase: ["error", {allow: ["num_policy"]}] */
  async getPolicy(num_policy) {
    const params = {
      methodName: 'GetPolicy',
      params: {
        num_policy,
      },
    };

    return this.#API.post(JSONLoader.APIEndpoints.ones.callMethod, params);
  }
}

module.exports = new OnesAPI();
