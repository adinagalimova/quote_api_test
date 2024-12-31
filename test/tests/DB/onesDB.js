const path = require('path');
const BaseDB = require('../../main/utils/DB/baseDB');
const Logger = require('../../main/utils/log/logger');
const DataUtils = require('../../main/utils/data/dataUtils');
const JSONLoader = require('../../main/utils/data/JSONLoader');
require('dotenv').config({ path: path.join(__dirname, '../../../', '.env.test'), override: true });

class OnesDB extends BaseDB {
  constructor() {
    super(
      '' || process.env.DB_HOST,
      '' || process.env.DB_USERNAME,
      '' || process.env.DB_PASSWORD,
      '' || process.env.DB_ONES_DATABASE,
      '' || process.env.DB_PORT,
    );
  }

  async waitStatusCodeUpdate(policyNumber) {
    Logger.log('[inf] ▶ wait policy status update');
    const target = 'status';
    while (true) { // eslint-disable-line no-constant-condition
      // eslint-disable-next-line no-await-in-loop
      const onesStatus = (await this.sqlSelect(
        'policies',
        target,
        'WHERE `policy_number` = ?',
        [policyNumber],
        { hasLogger: false },
      )).pop()[target];
      if (onesStatus === JSONLoader.dictOnes.policy_status.issued) break;
    }
  }

  async getOnesContent(policyNumber) {
    const target = 'request_body';
    const onesContent = (await this.sqlSelect(
      'policies',
      target,
      'WHERE `policy_number` = ?',
      [policyNumber],
    )).pop()[target];
    DataUtils.saveToJSON({ onesContent });
    return onesContent;
  }
}

module.exports = new OnesDB();
