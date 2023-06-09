// Global Types
import type {
  Request as $Request,
} from 'express';

// Helpers
import {
  matchedData,
  validationResult,
} from 'express-validator';
import {
  baseErrorKey,
  CustomError,
} from '@vroskus/library-error';

// Types
type $ValidationError = {
  msg: string;
  param: any;
  value?: any;
  location?: 'body' | 'query' | 'params' | 'cookies' | 'headers';
  nestedErrors?: Array<unknown>; // nestedErrors only exist when using the oneOf function
};

type $ValidationResult = {
  isEmpty: () => boolean;
  formatWith: (formatter: any) => $ValidationResult;
  array: (options?: {
    onlyFirstError: boolean;
  }) => Array<$ValidationError>;
  mapped: () => unknown;
  throw: () => unknown;
};

const removeEmptyValues = <O extends object>(object: O): O => {
  if (typeof object === 'string') {
    return object;
  }

  // eslint-disable-next-line complexity
  Object.keys(object).forEach((key: string) => {
    if (object[key] && Array.isArray(object[key])) {
      object[key].map(removeEmptyValues);
    } else if (object[key] && typeof object[key] === 'object') {
      removeEmptyValues(object[key]);
    } else if (object[key] === undefined) {
      // eslint-disable-next-line no-param-reassign
      delete object[key];
    }
  });

  return object;
};

const validateRequest = <
B extends Record<string, any>,
P extends Record<string, any>,
>(req: $Request): {
    body: B;
    params: P;
  } => {
  const result: $ValidationResult = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array();

    throw new CustomError(
      'Invalid request parameters',
      baseErrorKey.parametersValidationError,
      {
        data: {
          errors,
        },
        level: 'warning',
      },
    );
  }

  const matchedBody = matchedData(
    req,
    {
      includeOptionals: true,
      locations: ['body'],
    },
  );

  // @ts-ignore
  const body: B = removeEmptyValues<B>(matchedBody);

  const matchedParams = matchedData(
    req,
    {
      includeOptionals: true,
      locations: ['params'],
    },
  );

  // @ts-ignore
  const params: P = removeEmptyValues<P>(matchedParams);

  return {
    body,
    params,
  };
};

export {
  forbidBodyItem,
  validBodyArray,
  validBodyBoolean,
  validBodyDate,
  validBodyDateOrNull,
  validBodyDecimal,
  validBodyDecimalOrNull,
  validBodyEmail,
  validBodyEmailOrNull,
  validBodyEnum,
  validBodyEnumOrNull,
  validBodyId,
  validBodyIdOrNull,
  validBodyNumber,
  validBodyNumberOrNull,
  validBodyObject,
  validBodyObjectLike,
  validBodyPin,
  validBodyString,
  validBodyStringOrNull,
  validBodyTemplate,
  validParamsEnum,
  validParamsId,
  validParamsString,
  validQueryString,
} from './validationChains';

export default validateRequest;
