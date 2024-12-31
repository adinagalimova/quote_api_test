/* eslint no-restricted-syntax: ['off', 'ForInStatement'] */
const Logger = require('../log/logger');

class JSONMapper {
  static getNestedProperty(flattenedObj, path) {
    const keys = [];
    const values = [];
    for (const key in flattenedObj) {
      if (Object.hasOwn(flattenedObj, key)) {
        if (key.endsWith(`.${path}`) || key === path) {
          keys.push(key);
          values.push(flattenedObj[key]);
        }
      }
    }

    return { keys, values };
  }

  static deleteNotSimilarProperty(flattenedObj, mappingSchema) {
    const keysToDelete = [];
    const outputObj = { ...flattenedObj };
    for (const key in outputObj) {
      if (Object.hasOwn(outputObj, key)) {
        let shouldDelete = true;
        for (const path in mappingSchema) {
          if (Object.hasOwn(mappingSchema, path)) {
            if (key.endsWith(`.${path}`) || key === path) {
              shouldDelete = false;
              break;
            }
          }
        }

        if (shouldDelete) keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => delete outputObj[key]);
    return outputObj;
  }

  static flattenJSON(obj) {
    const result = {};
    const recursive = (currentObj, prefix = '') => {
      for (const objKey in currentObj) {
        if (Object.hasOwn(currentObj, objKey)) {
          const fullKey = prefix ? `${prefix}.${objKey}` : objKey;
          if (typeof currentObj[objKey] === 'object') {
            recursive(currentObj[objKey], fullKey);
          } else {
            result[fullKey] = currentObj[objKey];
          }
        }
      }
    };

    recursive(obj);
    return result;
  }

  static mapValues(firstData, secondData, mappingSchema) {
    const [firstName] = Object.keys(firstData);
    const firstObj = firstData[firstName];
    const [secondName] = Object.keys(secondData);
    const secondObj = secondData[secondName];
    const firstFlattenedObj = this.flattenJSON(firstObj);
    const secondFlattenedObj = this.flattenJSON(secondObj);
    const firstFlattenedObjKeys = Object.keys(firstFlattenedObj);
    const secondFlattenedObjKeys = Object.keys(secondFlattenedObj);
    for (const path in mappingSchema) {
      if (Object.hasOwn(mappingSchema, path)) {
        if (firstFlattenedObjKeys.some((key) => key.endsWith(path))) {
          if (secondFlattenedObjKeys.some((key) => key.endsWith(mappingSchema[path]))) {
            let index = 0;
            for (const key in firstFlattenedObj) {
              if (Object.hasOwn(firstFlattenedObj, key)) {
                if (this.getNestedProperty(firstFlattenedObj, path).keys.includes(key)) {
                  const valuesArr = this.getNestedProperty(secondFlattenedObj, mappingSchema[path])
                    .values;
                  firstFlattenedObj[key] = index >= valuesArr.length
                    ? valuesArr[valuesArr.length - 1]
                    : valuesArr[index];
                  index += 1;
                }
              }
            }
          } else {
            throw new Error(Logger.log(`[err]   mapping key "${mappingSchema[path]}" wasn't found in the ${secondName}`));
          }
        } else {
          throw new Error(Logger.log(`[err]   mapping key "${path}" wasn't found in the ${firstName}`));
        }
      }
    }

    return this.deleteNotSimilarProperty(firstFlattenedObj, mappingSchema);
  }

  static rewriteValues(mappedObj, firstDict, secondDict) {
    const firstDictKeys = Object.keys(firstDict);
    const secondDictKeys = Object.keys(secondDict);
    const outputObj = { ...mappedObj };
    for (const key in outputObj) {
      if (Object.hasOwn(outputObj, key)) {
        if (firstDictKeys.some((path) => this.getNestedProperty(outputObj, path)
          .keys.includes(key))
        && secondDictKeys.some((path) => this.getNestedProperty(outputObj, path)
          .keys.includes(key))) {
          secondDictKeys.forEach((dictKey) => {
            if (this.getNestedProperty(outputObj, dictKey).keys.includes(key)) {
              for (const dictSubKey in secondDict[dictKey]) {
                if (Object.hasOwn(secondDict[dictKey], dictSubKey)) {
                  if (secondDict[dictKey][dictSubKey] === outputObj[key] || dictSubKey === 'constant') {
                    outputObj[key] = firstDict[dictKey][dictSubKey];
                  }
                }
              }
            }
          });
        }
      }
    }

    return outputObj;
  }

  static unflattenJSON(flattenedObj) {
    const result = {};
    for (const key in flattenedObj) {
      if (Object.hasOwn(flattenedObj, key)) {
        const keys = key.split('.');
        let currentLevel = result;
        for (let i = 0; i < keys.length - 1; i += 1) {
          const currentKey = keys[i];
          const nextKeyIsArrayIndex = /^\d+$/.test(keys[i + 1]);
          if (!currentLevel[currentKey] || typeof currentLevel[currentKey] !== 'object') {
            currentLevel[currentKey] = nextKeyIsArrayIndex ? [] : {};
          }

          currentLevel = currentLevel[currentKey];
        }

        currentLevel[keys[keys.length - 1]] = flattenedObj[key];
      }
    }

    return result;
  }

  static safeMergeObjects(...mappedObjects) {
    const result = {};
    const locations = {};
    mappedObjects.forEach((mappedObj) => {
      const [currentLocation] = Object.keys(mappedObj);
      const data = mappedObj[currentLocation];
      locations[currentLocation] = {};
      for (const [key, value] of Object.entries(data)) {
        if (key in result) {
          if (result[key] !== value) {
            for (const location in locations) {
              if (Object.hasOwn(locations, location)) {
                if (key in locations[location]) {
                  if (location[key] !== value) {
                    throw new Error(`[err]   conflicting values for duplicated keys "${key}" found in the ${currentLocation} and in the ${location} during mapped objects merge`);
                  }
                }
              }
            }
          }
        }

        result[key] = value;
        locations[currentLocation][key] = value;
      }
    });

    return result;
  }
}

module.exports = JSONMapper;
