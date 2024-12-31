const chai = require('chai');
chai.use(require('chai-subset'));
chai.use(require('chai-json-schema'));
const Logger = require('../../main/utils/log/logger');
const JSONLoader = require('../../main/utils/data/JSONLoader');
const quoteAPI = require('../API/quoteAPI');
const dictionaryAPI = require('../API/dictionaryAPI');

chai.should();

describe("Quote API Test Suite from a Manager's Perspective:", async () => {
  beforeEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel) Logger.log(this.currentTest.title);
  });

  it('Test get CR LR value', async () => {
    const response = await quoteAPI.getCrLrValue();
    response.status.should.be.equal(200);
    response.data.should.containSubset(JSONLoader.templateResponse.crlrValue);
  });

  it('Test channel-details', async () => {
    const response = await dictionaryAPI.getChannelDetails();
    response.status.should.be.equal(200);
  });

  it('Test CRUD quote request', async () => {
    const response = await quoteAPI.createRequest();
    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.createRequestResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.createRequest);
    const responseId = response.data.data.id;

    const responseGet = await quoteAPI.getRequest(responseId);
    responseGet.status.should.be.equal(200);
    responseGet.data.should.be.jsonSchema(JSONLoader.getRequestResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.getRequest);
    const responseUpdate = await quoteAPI.updateRequest(responseId);
    responseUpdate.status.should.be.equal(200);
    responseUpdate.data.should.be.jsonSchema(JSONLoader.updateRequestResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.updateRequest);
  });

  it('Test calculation premium', async () => {
    const response = await quoteAPI.calculatePremium();
    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.calculatePremiumResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.calculatePremium);
  });

  it('Test document methods', async () => {
    const responseQuote = await quoteAPI.createRequest();
    responseQuote.status.should.be.equal(200);
    responseQuote.data.should.be.jsonSchema(JSONLoader.createRequestResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.createRequest);
    const responseQuoteId = responseQuote.data.data.id;

    const responseDocument = await quoteAPI.uploadDocument();
    responseDocument.status.should.be.equal(200);
    responseDocument.data.should.containSubset(JSONLoader.templateResponse.uploadDocument);
    const responseId = responseDocument.data.data.id;

    const responseGetDocument = await quoteAPI.getDocument(responseId);
    responseGetDocument.status.should.be.equal(200);
    responseGetDocument.data.should.be.jsonSchema(JSONLoader.templatePDF);

    const responseDelete = await quoteAPI.deleteDocument(responseId, responseQuoteId);
    responseDelete.status.should.be.equal(200);
    responseDelete.data.should.containSubset(JSONLoader.templateResponse.deleteDocument);
  });

  afterEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel) Logger.log(this.currentTest.state);
  });
});
