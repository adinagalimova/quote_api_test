const path = require('path');
const BaseAPI = require('../../main/utils/API/baseAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');
require('dotenv').config({ path: path.join(__dirname, '../../../', '.env.test'), override: true });

class TWBAPI extends BaseAPI {
  constructor(options = {
    baseURL: '' || process.env.ONES_HOST_REST_URL,
    timeout: JSONLoader.APIConfigData.timeout,
    headers: {
      Authorization: `Basic ${btoa(`${'' || process.env.ONES_LOGIN}:${'' || process.env.ONES_PASSWORD}`)}`,
    },
  }) {
    super(options);
  }

  async setPolicy(params) {
    return this.post(JSONLoader.APIEndpoints.TWB.setPolicy, params);
  }

  async startSetPolicyWaiting() {
    return this.get(JSONLoader.APIEndpoints.TWB.startSetPolicyWaiting);
  }

  /* eslint camelcase: ["error", {allow: ["num_policy", "rescinding_reason_id"]}] */
  async getPolicy(num_policy) {
    const params = {
      num_policy,
    };

    return this.get(JSONLoader.APIEndpoints.TWB.getPolicy, params);
  }

  async setCancellation(num_policy) {
    const params = {
      num_policy,
      rescinding_reason_id: 6,
    };

    return this.post(JSONLoader.APIEndpoints.TWB.setCancellation, params);
  }

  async getListByName(number) {
    const endpoint = JSONLoader.APIEndpoints.TWB.getListByName.toString()
      .replace('{number}', number);
    return this.get(endpoint);
  }
}

module.exports = new TWBAPI();
