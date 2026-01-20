import type {
  Schema,
} from 'zod';

import _ from 'lodash';

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
      'RESPONSE_VALIDATION_ERROR',
    );

    _.set(
      error,
      'data',
      err.issues,
    );

    throw error;
  }
};
