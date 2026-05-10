// Global Types
import type {
  Schema,
} from 'zod';

// Helpers
import _ from 'lodash';

// Enums
import {
  BaseErrorKey,
} from '@vroskus/library-error';

// Types
export type $Schema = Schema;

export {
  z,
} from 'zod';
export {
  validateRequest,
} from 'zod-express-middleware';

type $Data = Array<Record<string, unknown>> | Record<string, unknown>;

export const validateResponse = <D extends $Data>(
  data: D,
  schema: Schema,
): D => {
  try {
    return schema.parse(data);
  } catch (err) {
    const error = new Error('Invalid response data');

    _.set(
      error,
      'key',
      BaseErrorKey.responseValidationError,
    );

    _.set(
      error,
      'data',
      _.get(
        err,
        'issues',
      ),
    );

    throw error;
  }
};
