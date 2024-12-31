const moment = require('moment');
const JSONLoader = require('../data/JSONLoader');

class TimeUtils {
  static getDatesInterval(count, unitOfTime, options = {}) {
    const { dateBegin } = options;
    const startNextDay = options.startNextDay ?? true;
    const isNotIncluded = options.isNotIncluded ?? true;
    const reverseInterval = options.reverseInterval ?? false;

    let startDate;
    if (reverseInterval) {
      startDate = startNextDay ? moment().subtract(1, 'days') : moment();
    } else {
      startDate = startNextDay ? moment().add(1, 'days') : moment();
    }

    let finishDate;
    if (reverseInterval) {
      finishDate = dateBegin
        ? moment(dateBegin, JSONLoader.testData.datesFormat).subtract(count, unitOfTime)
        : moment(startDate).subtract(count, unitOfTime);
      if (isNotIncluded) {
        finishDate = moment(finishDate).add(1, 'days');
      }
    } else {
      finishDate = dateBegin
        ? moment(dateBegin, JSONLoader.testData.datesFormat).add(count, unitOfTime)
        : moment(startDate).add(count, unitOfTime);
      if (isNotIncluded) {
        finishDate = moment(finishDate).subtract(1, 'days');
      }
    }

    startDate = moment(startDate).format(JSONLoader.testData.datesFormat);
    finishDate = moment(finishDate).format(JSONLoader.testData.datesFormat);
    return reverseInterval
      ? { startDate: finishDate, finishDate: dateBegin ?? startDate }
      : { startDate: dateBegin ?? startDate, finishDate };
  }

  static reformatDate(date) {
    return moment(date, JSONLoader.testData.datesFormat)
      .format(JSONLoader.testData.datesFormatReport);
  }
}

module.exports = TimeUtils;
