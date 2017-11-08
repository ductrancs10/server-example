'use strict';

const moment = require('moment');
const _ = require('lodash');

// const MOMENT_DATETIME_FORMAT = require('../helpers/Const').MOMENT_DATETIME_FORMAT;
const Image = require('parse-image');
// const BeaustyleErrorCode = require('../modules/ErrorCode');
// const BeaustyleBaseQuery = require('../modules/BaseQuery.js');

const IMAGE_SIZES = {
  thumbLarge: {
    width: 800,
    height: 800
  },
  thumbMedium: {
    width: 600,
    height: 600
  },
  thumbSmall: {
    width: 400,
    height: 400
  }
};

const BeaustyUtils = {};

BeaustyUtils.convertCharacter2ByteTo1Byte = function(txtString) {
  const regex = /[０-ｚ！”＃＄％＆’（）＝＜＞，．？＿［］｛｝＠＾～＋／]/g;

  return txtString.replace(regex, function(ch) {
    return String.fromCharCode(ch.charCodeAt(0) - 65248);
  });
};

module.exports = {
  getErrorMessage: function(errors) {
    let msg = '';

    if (_.isString(errors)) {
      msg = errors;
    } else if (_.isArray(errors)) {
      for (let i = 0; i < errors.length; i++) {
        if (!_.isEmpty(errors[i])) {
          msg = errors[i].message;
          break;
        }
      }
    }

    return msg;
  },

  consoleLog: function(functionName, msg) {
    if (process.env.HiDESIGNS_ENABLE_DEBUG == undefined || process.env.HiDESIGNS_ENABLE_DEBUG == 1) {
      console.log('+----------------------------------------------------------------------------------+');
      console.log('|' + functionName);
      console.log('+----------------------------------------------------------------------------------+');
      console.log(msg);
    }
  },

  consoleError: function(functionName, msg) {
    console.error('「Error」Function ' + functionName + ' at ' + (new Date()).toUTCString());
    console.error('  Message: ' + msg);
  },

  isValidEmail: function(email) {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return regex.test(email);
  },

  getMissingFieldNameMessage: function(fieldName) {
    return '「' + fieldName + '」 ' + 'is missing.';
  },

  getMissingDataMessage: function(fieldName) {
    return '「' + fieldName + '」 ' + 'is missing data.';
  },

  getInvalidMessage: function(fieldName) {
    return '「' + fieldName + '」 ' + 'is invalid format.';
  },

  generateImageThumbs: function(imageObj, imageInfo) {
    return Parse.Cloud.httpRequest({ url: imageInfo.imageUrl }).then((res) => {
      const promises = [];

      // Create an Image from the data.
      const originalImage = new Image();
      promises.push(originalImage.setData(res.buffer));

      const thumbLarge = new Image();
      promises.push(thumbLarge.setData(res.buffer));

      const thumbMedium = new Image();
      promises.push(thumbMedium.setData(res.buffer));

      const thumbSmall = new Image();
      promises.push(thumbSmall.setData(res.buffer));

      return Parse.Promise.when(promises);
    }).then((images) => {
      const originalImage = images[0];
      const w = originalImage.width();
      const h = originalImage.height();
      const promises = [];

      let thumbLarge = images[1];
      if (w > IMAGE_SIZES.thumbLarge.width && h <= IMAGE_SIZES.thumbLarge.height) {
        thumbLarge = thumbLarge.scale({
          ratio: (IMAGE_SIZES.thumbLarge.width / w)
        });
      } else if (w <= IMAGE_SIZES.thumbLarge.width && h > IMAGE_SIZES.thumbLarge.height) {
        thumbLarge = thumbLarge.scale({
          ratio: (IMAGE_SIZES.thumbLarge.height / h)
        });
      } else if (w >= IMAGE_SIZES.thumbLarge.width && h >= IMAGE_SIZES.thumbLarge.height) {
        thumbLarge = thumbLarge.scale({
          width: IMAGE_SIZES.thumbLarge.width,
          height: IMAGE_SIZES.thumbLarge.height
        });
      }
      promises.push(thumbLarge);

      let thumbMedium = images[2];
      if (w > IMAGE_SIZES.thumbMedium.width && h <= IMAGE_SIZES.thumbMedium.height) {
        thumbMedium = thumbMedium.scale({
          ratio: (IMAGE_SIZES.thumbMedium.width / w)
        });
      } else if (w <= IMAGE_SIZES.thumbMedium.width && h > IMAGE_SIZES.thumbMedium.height) {
        thumbMedium = thumbMedium.scale({
          ratio: (IMAGE_SIZES.thumbMedium.height / h)
        });
      } else if (w >= IMAGE_SIZES.thumbMedium.width && h >= IMAGE_SIZES.thumbMedium.height) {
        thumbMedium = thumbMedium.scale({
          width: IMAGE_SIZES.thumbMedium.width,
          height: IMAGE_SIZES.thumbMedium.height
        });
      }
      promises.push(thumbMedium);

      let thumbSmall = images[3];
      if (w > IMAGE_SIZES.thumbSmall.width && h <= IMAGE_SIZES.thumbSmall.height) {
        thumbSmall = thumbSmall.scale({
          ratio: (IMAGE_SIZES.thumbSmall.width / w)
        });
      } else if (w <= IMAGE_SIZES.thumbSmall.width && h > IMAGE_SIZES.thumbSmall.height) {
        thumbSmall = thumbSmall.scale({
          ratio: (IMAGE_SIZES.thumbSmall.height / h)
        });
      } else if (w >= IMAGE_SIZES.thumbSmall.width && h >= IMAGE_SIZES.thumbSmall.height) {
        thumbSmall = thumbSmall.scale({
          width: IMAGE_SIZES.thumbSmall.width,
          height: IMAGE_SIZES.thumbSmall.height
        });
      }
      promises.push(thumbSmall);

      return Parse.Promise.when(promises);
    }).then((images) => {
      return Parse.Promise.when([images[0].data(), images[1].data(), images[2].data()]);
    }).then((imageData) => {
      let thumbLargeFileName = imageInfo.prefixFilename + '_' +
        IMAGE_SIZES.thumbLarge.width + 'x' + IMAGE_SIZES.thumbLarge.height + '.jpg';
      let thumbLargeFile = new Parse.File(thumbLargeFileName, { base64: imageData[0].toString('base64') });

      let thumbMediumFileName = imageInfo.prefixFilename + '_' +
        IMAGE_SIZES.thumbMedium.width + 'x' + IMAGE_SIZES.thumbMedium.height + '.jpg';
      let thumbMediumFile = new Parse.File(thumbMediumFileName, { base64: imageData[1].toString('base64') });

      let thumbSmallFileName = imageInfo.prefixFilename + '_' +
        IMAGE_SIZES.thumbSmall.width + 'x' + IMAGE_SIZES.thumbSmall.height + '.jpg';
      let thumbSmallFile = new Parse.File(thumbSmallFileName, { base64: imageData[2].toString('base64') });

      return Parse.Promise.when([thumbLargeFile.save(), thumbMediumFile.save(), thumbSmallFile.save()]);
    }).then((thumbFiles) => {
      imageObj.set('large', thumbFiles[0]);
      imageObj.set('medium', thumbFiles[1]);
      imageObj.set('small', thumbFiles[2]);

      return imageObj.save();
    }).catch((err) => {
      return Parse.Promise.reject(err);
    });
  },

  getDuplicateMessage: function(object) {
    return '「' + JSON.stringify(object) + '」 ' + 'existed.';
  },

  validateByType: function(fieldType, value) {
    if ((fieldType === 'String' && (!_.isString(value) || _.isEmpty(value))) ||
      (fieldType === 'Array' && (!_.isArray(value) || !_.isEmpty(value))) ||
      (fieldType === 'Number' && !_.isNumber(value)) ||
      (fieldType === 'Boolean' && !_.isBoolean(value)) ||
      (fieldType === 'Object' && !_.isObject(value))
    ) {
      return BeaustyleErrorCode.MISSING_DATA_OR_EMPTY;
    } else if (fieldType === 'Email') {
      if (_.isEmpty(value)) {
        return BeaustyleErrorCode.MISSING_DATA_OR_EMPTY;
      }

      if (!this.isValidEmail(value)) {
        return BeaustyleErrorCode.INVALID_EMAIL_ADDRESS;
      }
    }

    return '';
  },

  getParams4Paging: function(request) {
    const params = request.params;
    const orderBy = params.orderBy ? params.orderBy.trim() : '';
    const asc = params.asc;
    let page = !_.isUndefined(request.params.page) ? parseInt(request.params.page) : 1;
    page = (page <= 0) ? 1 : page;
    const limit = (!_.isUndefined(request.params.limit)) ? parseInt(request.params.limit) : 10;
    const offset = (page - 1) * limit;

    return {
      orderBy: orderBy,
      asc: asc,
      offset: offset,
      limit: limit
    };
  },

  trimSpecialsCharacters: function(txtString) {
    const newStr = BeaustyUtils.convertCharacter2ByteTo1Byte(txtString.trim());

    return _.escapeRegExp(newStr.replace(/\\|\*/g, '').replace(/\s+/g, ' '));
  },

  removeObjFromArr: function(arr, obj) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id == obj.id) {
        arr.splice(i, 1); break;
      }
    }

    return arr;
  },

  validDateString: function(string) {
    return moment(string, MOMENT_DATETIME_FORMAT.YYYY_MM_DD, true).isValid();
  },

  getStringSorted: function(strs) {
    return _.join(_.sortBy(strs, _.toLower), '-');
  },

  getAlertMessageByType: function(notificationType) {
    const alertQuery = BeaustyleBaseQuery.getAlertQuery();
    alertQuery.equalTo('type', notificationType);

    return alertQuery.first();
  },

  createOrUpdateTimeline: function(timelineData, timelineParse) {
    const Timeline = Parse.Object.extend('Timeline');
    const timelineObj = (timelineParse) ? timelineParse : new Timeline();

    for (let key in timelineData) {
      timelineObj.set(key, timelineData[key]);
    }

    return timelineObj.save(null, { useMasterKey: true });
  },

  getFirstTimeline: function(timelineData) {
    let timelineQuery = BeaustyleBaseQuery.getTimelineQuery();
    timelineQuery.equalTo('user', timelineData.user);

    if (!_.isUndefined(timelineData.post)) {
      timelineQuery.equalTo('post', timelineData.post);
    } else if (!_.isUndefined(timelineData.follower)) {
      timelineQuery.equalTo('follower', timelineData.follower);
    }

    if (!_.isUndefined(timelineData.mentionType)) {
      timelineQuery.containedIn('mentionType', timelineData.mentionTypes);
    }

    return timelineQuery.first();
  }
};
