// Helpers
import moment from 'moment';
import _ from 'lodash';
import isUUID from 'is-uuid';

type $CustomValidators = Record<
string,
(...args: Array<Array<string> | boolean | string>) => Promise<void>
>;

const zeroValue: number = 0;

const customValidators: $CustomValidators = {
  intersects: async (
    param: Array<string>,
    array: Array<string>,
  ) => new Promise((resolve, reject) => {
    const result = _.filter(
      param,
      (item) => !_.includes(
        array,
        item,
      ),
    );

    if (result.length === zeroValue) {
      resolve();
    } else {
      reject();
    }
  }),
  isDate: async (
    param: unknown,
  ) => new Promise((resolve, reject) => {
    if (param && moment(param).isValid()) {
      resolve();
    } else {
      reject();
    }
  }),
  isObject: async (
    param: unknown,
    required?: boolean,
  ): Promise<void> => new Promise((resolve, reject) => {
    if (_.isPlainObject(param) || (!required && param === null)) {
      resolve();
    } else {
      reject();
    }
  }),
  isObjectLike: async (
    param: unknown,
    required?: boolean,
  ): Promise<void> => new Promise((resolve, reject) => {
    if (_.isObjectLike(param) || (!required && param === null)) {
      resolve();
    } else {
      reject();
    }
  }),
  isUUIDv4: async (
    param: unknown,
  ): Promise<void> => new Promise((resolve, reject) => {
    if (param && isUUID.v4(param)) {
      resolve();
    } else {
      reject();
    }
  }),
};

export default customValidators;
