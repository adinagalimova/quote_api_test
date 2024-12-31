const fs = require('fs');
const JSONMapper = require('./JSONMapper');
const JSONLoader = require('./JSONLoader');
const TimeUtils = require('../time/timeUtils');

class DataUtils {
  static saveToJSON(obj) {
    const [name] = Object.keys(obj);
    const data = obj[name];
    const replacer = (key, value) => (typeof value === 'undefined' ? null : value);
    fs.writeFileSync(`./test/artifacts/${name}.json`, JSON.stringify(data, replacer, 4));
  }

  static passBugsTWB(mappedData, getPolicyData) {
    const outputData = { ...mappedData };
    // Pass TWB bug with "doc_number" whitespaces
    const docNumberFullKeys = JSONMapper.getNestedProperty(outputData, 'doc_number').keys;
    docNumberFullKeys.forEach((fullKey) => {
      outputData[fullKey] = /\s/.test(JSONMapper.flattenJSON(getPolicyData)[fullKey])
        ? outputData[fullKey].replace(new RegExp(JSONLoader.testData.docNumberOnesRegexPattern, 'g'), ' ')
        : outputData[fullKey];
    });

    // Pass TWB bug with "verify_bool" value without verification
    if (getPolicyData.contracts[0].verify_bool === 1
    && outputData['contracts.0.verify_bool'] === 0) {
      outputData['contracts.0.verify_bool'] = getPolicyData.contracts[0].verify_bool;
    }

    return outputData;
  }

  static mapRequestToOnes(quoteResponseFromTWB, quoteRequest, optionalSchema) {
    this.saveToJSON({ quoteResponseFromTWB });
    this.saveToJSON({ quoteRequest });

    const mappedData = JSONMapper.mapValues(
      { quoteRequest },
      { quoteResponseFromTWB },
      optionalSchema ?? JSONLoader.requestSetQuotationMapSchema,
    );
    const requestToOnesMappedData = JSONMapper.unflattenJSON(mappedData);
    this.saveToJSON({ requestToOnesMappedData });
    return requestToOnesMappedData;
  }

  static mapESBDToOnes(
    getPolicyData,
    getContractByNumberData,
    holderGetClientByIDData,
    insuredGetClientByIDData,
  ) {
    this.saveToJSON({ getPolicyData });
    const firstMappedPart = JSONMapper.mapValues(
      { getPolicyData },
      { holderGetClientByIDData },
      JSONLoader.holderGetClientByIDToGetPolicyMapSchema,
    );

    const secondMappedPart = JSONMapper.mapValues(
      { getPolicyData },
      { insuredGetClientByIDData },
      JSONLoader.insuredGetClientByIDToGetPolicyMapSchema,
    );

    const thirdMappedPart = JSONMapper.mapValues(
      { getPolicyData },
      { getContractByNumberData },
      JSONLoader.getContractByNumberToGetPolicyMapSchema,
    );

    let mappedData = JSONMapper.safeMergeObjects(
      { firstMappedPart },
      { secondMappedPart },
      { thirdMappedPart },
    );

    const paymentScheduleDateFullKey = JSONMapper.getNestedProperty(mappedData, 'date').keys.pop();
    const datesInterval = TimeUtils.getDatesInterval(
      ...JSONLoader.testData.paymentDateIncrement,
      {
        dateBegin: mappedData[paymentScheduleDateFullKey],
        isNotIncluded: false,
      },
    );
    mappedData[paymentScheduleDateFullKey] = datesInterval.finishDate;

    mappedData = this.passBugsTWB(mappedData, getPolicyData);
    const rewritedData = JSONMapper.rewriteValues(
      mappedData,
      JSONLoader.dictOnes,
      JSONLoader.dictESBD,
    );

    const ESBDToOnesMappedData = JSONMapper.unflattenJSON(rewritedData);
    this.saveToJSON({ ESBDToOnesMappedData });
    this.saveToJSON({ holderGetClientByIDData });
    this.saveToJSON({ insuredGetClientByIDData });
    this.saveToJSON({ getContractByNumberData });
    return ESBDToOnesMappedData;
  }
}

module.exports = DataUtils;
