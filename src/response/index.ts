// Helpers
import * as Joi from 'joi';
import _ from 'lodash';
import {
  baseErrorKey,
  CustomError,
} from '@vroskus/library-error';

// Types
import type {
  $Schema,
} from '../types';

export const Validator = Joi;

// validateResponse method
const validateResponse = <D extends Record<string, unknown>>(data: D, schema: $Schema): D => {
  let validationData = data;

  if (_.isObject(data)) {
    const stringValue: string | void = JSON.stringify(data);

    if (stringValue) {
      validationData = JSON.parse(stringValue);
    }
  }

  const {
    error,
    value,
  } = schema().validate(
    validationData,
    {
      presence: 'required',
      stripUnknown: true,
    },
  );

  if (error) {
    throw new CustomError(
      'Data validation did not pass',
      baseErrorKey.dataValidationError,
      {
        data: error,
      },
    );
  }

  return value;
};

export default validateResponse;
