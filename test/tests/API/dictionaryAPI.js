const path = require('path');
const authAPI = require('./authAPI');
const BaseAPI = require('../../main/utils/API/baseAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');
require('dotenv').config({ path: path.join(__dirname, '../../../', '.env.test'), override: true });

class DictionaryAPI extends BaseAPI {
  #API;

  #options;

  constructor(options = {
    baseURL: '' || process.env.GATEWAY_URL,
  }) {
    super(options);
    this.#options = options;
  }

  async setToken() {
    const response = await authAPI.auth({ APIName: 'Dictionary API' });
    this.#options.headers = {};
    this.#options.headers.Authorization = `Bearer ${response.data.data.access_token}`;
    this.#API = new DictionaryAPI(this.#options);
  }

  async toggleServer() {
    const params = {
      setting: JSONLoader.configData.servers,
    };

    return this.#API.post(JSONLoader.APIEndpoints.dictionary.servers, params);
  }

  async toggleVerification() {
    const params = {
      value: Number(JSONLoader.configData.verification),
    };

    return this.#API.patch(JSONLoader.APIEndpoints.dictionary.verifyBool, params);
  }

  async getChannelDetails() {
    const params = {
      where: {
        sales_channel_id_1c: {
          operator: JSONLoader.testData.sales_channel_id_1c.operator,
          value: JSONLoader.testData.sales_channel_id_1c.value,
        },
      },
    };

    return this.#API.get(JSONLoader.APIEndpoints.dictionary.getChannelDetails, params);
  }
}

module.exports = new DictionaryAPI();
