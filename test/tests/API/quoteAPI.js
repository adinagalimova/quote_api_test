const path = require('path');
const authAPI = require('./authAPI');
const BaseAPI = require('../../main/utils/API/baseAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');
const Randomizer = require('../../main/utils/random/randomizer');
require('dotenv').config({ path: path.join(__dirname, '../../../', '.env.test'), override: true });

class QuoteAPI extends BaseAPI {
  #API;

  #user;

  #options;

  constructor(options = {
    baseURL: '' || process.env.GATEWAY_URL,
  }) {
    super(options);
    this.#options = options;
  }

  async setToken() {
    this.#user = await authAPI.getTestUser();
    const response = await authAPI.auth({ user: this.#user, APIName: 'quote API' });
    this.#options.headers = {};
    this.#options.headers.Authorization = `Bearer ${response.data.data.access_token}`;
    this.#API = new QuoteAPI(this.#options);
  }

  async getCrLrValue() {
    const params = {
      ins_type_id: JSONLoader.testData.ins_type_id,
    };

    return this.#API.get(JSONLoader.APIEndpoints.quote.getCrLrValue, params);
  }

  async createRequest() {
    const params = JSONLoader.templateCreateRequest;

    return this.#API.post(JSONLoader.APIEndpoints.quote.createRequest, params);
  }

  async getRequest(id) {
    const endpoint = JSONLoader.APIEndpoints.quote.getRequest.toString()
      .replace('{id}', id);

    return this.#API.get(endpoint);
  }

  async updateRequest(id) {
    const params = JSONLoader.templateUpdateRequest;
    const endpoint = JSONLoader.APIEndpoints.quote.updateRequest.toString()
      .replace('{id}', id);

    return this.#API.put(endpoint, params);
  }

  async setRevisionRequest(id) {
    const params = JSONLoader.templateSetRevisionRequest;
    const endpoint = JSONLoader.APIEndpoints.quote.setRevision.toString()
      .replace('{id}', id);

    return this.#API.put(endpoint, params);
  }

  async approveRequest(id) {
    const params = JSONLoader.templateApproveRequest;
    const endpoint = JSONLoader.APIEndpoints.quote.approveRequest.toString()
      .replace('{id}', id);

    return this.#API.put(endpoint, params);
  }

  async setQuoteToOnes(id) {
    const endpoint = JSONLoader.APIEndpoints.quote.setToOnes.toString()
      .replace('{id}', id);

    return this.#API.put(endpoint);
  }

  async calculatePremium() {
    const params = {
      insurance_amount: Randomizer.getRandomInteger(10000000, 100000),
      tariff: Randomizer.getRandomFloat(1, 10),
    };

    return this.#API.post(JSONLoader.APIEndpoints.quote.calculatePremium, params);
  }

  async uploadDocument() {
    const params = {
      quote_id: JSONLoader.testPDF.quote_id,
      title: JSONLoader.testPDF.title,
      content: JSONLoader.testPDF.content,
    };
    return this.#API.post(JSONLoader.APIEndpoints.quote.uploadDocument, params);
  }

  async getDocument(id) {
    const endpoint = JSONLoader.APIEndpoints.quote.getDocument.toString()
      .replace('{id}', id);

    return this.#API.get(endpoint);
  }

  async deleteDocument(id, quoteID) {
    const endpoint = JSONLoader.APIEndpoints.quote.deleteDocument.toString()
      .replace('{id}', id)
      .replace('{quote_id}', quoteID);

    return this.#API.delete(endpoint);
  }
}

module.exports = new QuoteAPI();
