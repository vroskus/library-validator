// Helpers
import moment from 'moment';
import _ from 'lodash';
import isUUID from 'is-uuid';

type $CustomValidators = Record<string, (...args: any) => Promise<void>>;

const customValidators: $CustomValidators = {
  intersects: async (param, array) => new Promise((resolve, reject) => {
    const result = _.filter(
      param,
      (item) => !_.includes(
        array,
        item,
      ),
    );

    if (result.length === 0) {
      resolve();
    } else {
      reject();
    }
  }),
  isDate: async (param: string) => new Promise((resolve, reject) => {
    if (moment(param).isValid()) {
      resolve();
    } else {
      reject();
    }
  }),
  isObject: async (param, required) => new Promise((resolve, reject) => {
    if (_.isPlainObject(param) || (!required && param === null)) {
      resolve();
    } else {
      reject();
    }
  }),
  isObjectLike: async (param, required) => new Promise((resolve, reject) => {
    if (_.isObjectLike(param) || (!required && param === null)) {
      resolve();
    } else {
      reject();
    }
  }),
  isUUIDv4: async (param: string) => new Promise((resolve, reject) => {
    if (isUUID.v4(param)) {
      resolve();
    } else {
      reject();
    }
  }),
};

export default customValidators;
