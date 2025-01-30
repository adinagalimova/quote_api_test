const chai = require('chai');
chai.use(require('chai-subset'));
chai.use(require('chai-json-schema'));
const Logger = require('../../main/utils/log/logger');
const JSONLoader = require('../../main/utils/data/JSONLoader');
const quoteAPI = require('../API/quoteAPI');
const TWBAPI = require('../API/TWBAPI');
const DataUtils = require('../../main/utils/data/dataUtils');

chai.should();

describe("Quote API Test Suite from a Manager's Perspective:", async () => {
  beforeEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel) Logger.log(this.currentTest.title);
  });

  it('Test ones', async () => {
    const response = await quoteAPI.createRequest();
    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.createRequestResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.createRequest);
    const responseID = response.data.data.id;
    const parentID = response.data.data.parent_id;
    const responseUpdate = await quoteAPI.updateRequest(responseID);
    responseUpdate.status.should.be.equal(200);
    responseUpdate.data.should.be.jsonSchema(JSONLoader.updateRequestResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.updateRequest);

    const setRevisionRequest = await quoteAPI.setRevisionRequest(responseID);
    setRevisionRequest.status.should.be.equal(200);
    setRevisionRequest.data.should.containSubset(JSONLoader.templateResponse.setRevisionRequest);
    const setRevisionID = setRevisionRequest.data.data.id;

    const responseUpdateAfterRevision = await quoteAPI.updateRequest(setRevisionID);
    responseUpdateAfterRevision.status.should.be.equal(200);
    responseUpdateAfterRevision.data.should.be.jsonSchema(JSONLoader.updateRequestResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.updateRequest);
    const responseUpdateAfterRevisionID = responseUpdateAfterRevision.data.data.id;
    const approveRequest = await quoteAPI.approveRequest(responseUpdateAfterRevisionID);
    approveRequest.status.should.be.equal(200);
    approveRequest.data.should.containSubset(JSONLoader.templateResponse.approveRequest);
    const approvedID = approveRequest.data.data.id;

    const setRequest = await quoteAPI.setQuoteToOnes(approvedID);
    setRequest.status.should.be.equal(200);
    setRequest.data.should.containSubset(JSONLoader.templateResponse.setToOnes);

    const responseGet = await quoteAPI.getRequest(approvedID);
    responseGet.status.should.be.equal(200);
    responseGet.data.should.be.jsonSchema(JSONLoader.getRequestResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.getRequest);
    const quoteRequest = responseGet.data.data;

    const responseTWB = await TWBAPI.getListByName(parentID);
    responseTWB.status.should.be.equal(200);
    const quoteResponseFromTWB = responseTWB.data.object_list;

    const mappedData = await DataUtils.mapRequestToOnes(
      quoteResponseFromTWB,
      quoteRequest,
    );

    if (!mappedData || Object.keys(mappedData).length === 0) {
      Logger.log('[inf]   Error: mappedData is empty');
      throw new Error();
    }
    quoteRequest.should.containSubset(mappedData);
  });

  afterEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel) Logger.log(this.currentTest.state);
  });
});
