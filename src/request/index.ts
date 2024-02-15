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
  CustomError,
  baseErrorKey,
} from '@vroskus/library-error';

// Types
import type {
  Result,
  ValidationError,
} from 'express-validator';

type $ValidationResult = Result<ValidationError>;

const removeEmptyValues = <O extends Record<string, unknown>>(object: O): O => {
  if (typeof object === 'string') {
    return object;
  }

  // eslint-disable-next-line complexity
  Object.keys(object).forEach((key: string) => {
    const innerObject = object[key];

    if (innerObject && Array.isArray(innerObject)) {
      innerObject.map(removeEmptyValues);
    } else if (innerObject && typeof innerObject === 'object') {
      removeEmptyValues(innerObject as Record<string, unknown>);
    } else if (innerObject === undefined) {
      // eslint-disable-next-line no-param-reassign
      delete object[key];
    }
  });

  return object;
};

const validateRequest = <I extends {
  body?: Record<string, unknown>;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
}>(req: $Request): {
    body?: I['body'];
    params?: I['params'];
    query?: I['query'];
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

  const data = {
    body: matchedData(
      req,
      {
        includeOptionals: true,
        locations: ['body'],
      },
    ) as I['body'],
    params: matchedData(
      req,
      {
        includeOptionals: true,
        locations: ['params'],
      },
    ) as I['params'],
    query: matchedData(
      req,
      {
        includeOptionals: true,
        locations: ['query'],
      },
    ) as I['query'],
  };

  const cleanData = removeEmptyValues(data);

  return cleanData;
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
