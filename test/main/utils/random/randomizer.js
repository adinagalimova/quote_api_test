const moment = require('moment');
const JSONLoader = require('../data/JSONLoader');

class Randomizer {
  static getRandomDatesIntervalFromTomorrow(count, unitOfTime) {
    const nextDayObject = moment().add(1, 'days').startOf('day');
    const unixOne = nextDayObject.unix();
    const unixTwo = moment(moment().add(1, 'days').startOf('day')).add(count, unitOfTime).unix();

    const startDateUnix = moment.unix(this.getRandomFloat(unixOne, unixTwo)).unix();
    let finishDateUnix;
    do {
      finishDateUnix = moment.unix(this.getRandomFloat(startDateUnix, unixTwo)).unix();
    } while ((finishDateUnix - startDateUnix) < 86400 * 2);

    const startDateObject = moment.unix(startDateUnix).startOf('day');
    const finishDateObject = moment.unix(finishDateUnix).startOf('day');
    const startDate = startDateObject.format(JSONLoader.testData.datesFormat);
    const finishDate = finishDateObject.format(JSONLoader.testData.datesFormat);

    const daysDifferenceIncluded = finishDateObject.diff(startDateObject, 'days') + 1;

    const getAbsoluteMonth = (date) => {
      const months = Number(moment(date, JSONLoader.testData.datesFormat).format('MM'));
      const years = Number(moment(date, JSONLoader.testData.datesFormat).format('YYYY'));
      return months + (years * 12);
    };

    const currentMonth = getAbsoluteMonth(moment.unix(unixOne)
      .format(JSONLoader.testData.datesFormat));
    const startMonth = getAbsoluteMonth(startDate);
    const finishMonth = getAbsoluteMonth(finishDate);
    let startMonthDifference = startMonth - currentMonth;
    let finishMonthDifference = finishMonth - currentMonth;

    if (nextDayObject.date() === 1) startMonthDifference += 1;
    if (nextDayObject.date() === 1) finishMonthDifference += 1;

    return {
      startDate,
      finishDate,
      startMonthDifference,
      finishMonthDifference,
      daysDifferenceIncluded,
    };
  }

  static getRandomString(
    hasLowerCase = false,
    hasUpperCase = false,
    hasNumber = false,
    hasCyrillic = false,
    chosenLetter = false,
    minLength = 1,
    maxLength = 10,
  ) {
    const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const cyrillicLetters = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';

    const length = this.getRandomInteger(maxLength, minLength);

    let randomString = '';
    if (chosenLetter) randomString += chosenLetter;

    let requiredCharacters = '';
    if (hasLowerCase) {
      requiredCharacters
      += lowerCaseLetters.charAt(Math.floor(Math.random() * lowerCaseLetters.length));
    }

    if (hasUpperCase) {
      requiredCharacters
      += upperCaseLetters.charAt(Math.floor(Math.random() * upperCaseLetters.length));
    }

    if (hasNumber) {
      requiredCharacters
      += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    if (hasCyrillic) {
      requiredCharacters
      += cyrillicLetters.charAt(Math.floor(Math.random() * cyrillicLetters.length));
    }

    randomString += requiredCharacters;

    const characters = (hasLowerCase ? lowerCaseLetters : '')
    + (hasUpperCase ? upperCaseLetters : '')
    + (hasNumber ? numbers : '')
    + (hasCyrillic ? cyrillicLetters : '');
    const charactersLength = characters.length;
    const randomLength = length - randomString.length;

    for (let i = 0; i < randomLength; i += 1) {
      randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return this.stringShuffler(randomString);
  }

  static stringShuffler(inputString) {
    const array = inputString.split('');
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array.join('');
  }

  static getRandomInteger(max = 9, min = 0) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  static randomizeSetPolicyRequest(requestData) {
    const params = { ...requestData };
    const datesInterval = this
      .getRandomDatesIntervalFromTomorrow(...JSONLoader.testData.timeIncrement);
    params.date_begin = datesInterval.startDate;
    params.external_id = this.getRandomString(false, false, true, false, false, 20, 20);
    params.period = this.getRandomInteger(12, 1);
    params.insurance_sum_in_mrp = JSONLoader.testData
      .insuranceSumInMRP[this.getRandomInteger(JSONLoader.testData.insuranceSumInMRP.length - 1)];
    params.clients[0].pdl = this.getRandomInteger(1);
    params.clients[1].pdl = this.getRandomInteger(1);

    return params;
  }
}

module.exports = Randomizer;
