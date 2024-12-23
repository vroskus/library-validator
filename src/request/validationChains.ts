// Global Types
import type {
  RequestHandler as $Middleware,
} from 'express';
import type {
  ValidationChain,
} from 'express-validator';

// Helpers
import {
  body,
  param,
  query,
} from 'express-validator';
import _ from 'lodash';
import customValidators from './customValidators';

type $DefaultValidation = (
  item: string,
  required?: boolean,
  includeNull?: boolean,
) => $Middleware;

// Types
type $ObjectType = Record<string, string>;

// validation chain instance

type $ValidQueryBase = (item: string, required?: boolean) => ValidationChain;

const validQueryBase: $ValidQueryBase = (item, required = false) => {
  const queryItem = query(item);

  if (!required) {
    queryItem.optional();
  }

  return queryItem.exists({
    checkNull: required,
  }).withMessage(`'${item}' is required`);
};

export const validQueryString: $DefaultValidation = (item, required) => {
  const queryItem = validQueryBase(
    item,
    required,
  );

  return queryItem.isString().withMessage(`'${item}' has to be a string`);
};

type $ValidParamsBase = (item: string, required?: boolean) => ValidationChain;

const validParamsBase: $ValidParamsBase = (item, required = false) => {
  const paramsItem = param(item);

  if (!required) {
    paramsItem.optional();
  }

  return paramsItem.exists({
    checkNull: required,
  }).withMessage(`'${item}' is required`);
};

export const validParamsString: $DefaultValidation = (item, required) => {
  const paramsItem = validParamsBase(
    item,
    required,
  );

  return paramsItem.isString().withMessage(`'${item}' has to be a string`);
};

export const validParamsId: $DefaultValidation = (item, required) => {
  const paramsItem = validParamsBase(
    item,
    required,
  );

  const {
    isUUIDv4,
  } = customValidators;

  return paramsItem.custom((value) => isUUIDv4(value))
    .withMessage(`'${item}' has to be an UUIDv4`);
};

export const validParamsEnum = (
  item: string,
  types: $ObjectType,
  required?: boolean,
) => {
  const paramsItem = validParamsBase(
    item,
    required,
  );

  const typesValues: Array<string> = _.values(types);

  return paramsItem.isIn(typesValues)
    .withMessage(`invalid '${item}' parameter, has to be one of: [${typesValues.join(', ')}]`);
};

const validBodyBase = (
  item: string,
  required: boolean | void = false,
  includeNull: boolean | void = false,
) => {
  const bodyItem = body(item);

  if (!required) {
    bodyItem.optional();
  }

  return bodyItem
    .exists({
      checkNull: !!((!includeNull && required)),
    })
    .withMessage(`'${item}' is required`);
};

export const validBodyString: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
  );

  return bodyItem.isString().withMessage(`'${item}' has to be a string`);
};

export const validBodyStringOrNull: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
    true,
  );

  bodyItem.custom((value) => _.isString(value) || _.isNull(value))
    .withMessage(`'${item}' has to be a string or null`);

  return bodyItem;
};

export const validBodyNumber: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
  );

  return bodyItem.isInt().withMessage(`'${item}' has to be a number`);
};

export const validBodyNumberOrNull: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
    true,
  );

  bodyItem.custom((value) => _.isNumber(value) || _.isNull(value))
    .withMessage(`'${item}' has to be a number or null`);

  return bodyItem;
};

export const validBodyDecimal: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
  );

  return bodyItem.isDecimal().withMessage(`'${item}' has to be a decimal`);
};

export const validBodyDecimalOrNull: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
    true,
  );

  bodyItem.custom((value) => _.isNumber(value) || _.isNull(value))
    .withMessage(`'${item}' has to be a decimal or null`);

  return bodyItem;
};

export const validBodyBoolean: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
  );

  return bodyItem.isBoolean().withMessage(`'${item}' has to be a boolean`);
};

export const validBodyEmail: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
  );

  return bodyItem.isEmail().withMessage(`'${item}' has to be a valid email address`);
};

export const validBodyEmailOrNull: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
    true,
  );

  /* eslint-disable-next-line sonarjs/slow-regex */
  return bodyItem.custom((value) => _.isNull(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    .withMessage(`'${item}' has to be a valid email address or null`);
};

export const validBodyPin: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
  );

  return bodyItem.isString().withMessage(`'${item}' has to be a string`).isLength({
    max: 4,
    min: 4,
  }).withMessage(`'${item}' has to be 4 characters length`)
    .custom((value) => /^.*?\d$/.test(value))
    .withMessage(`'${item}' value must be digits (0-9)`);
};

export const validBodyId: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
  );

  const {
    isUUIDv4,
  } = customValidators;

  return bodyItem.custom((value) => isUUIDv4(value))
    .withMessage(`'${item}' has to be an UUIDv4`);
};

export const validBodyIdOrNull: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
    true,
  );

  const {
    isUUIDv4,
  } = customValidators;

  return bodyItem.custom((value) => _.isNull(value) || isUUIDv4(value))
    .withMessage(`'${item}' has to be an UUIDv4 or null`);
};

type $ValidBodyEnum = (
  item: string,
  types: $ObjectType,
  required?: boolean,
) => $Middleware;

// validation chain instance
export const validBodyEnum: $ValidBodyEnum = (item, types, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
  );

  const typesValues: Array<string> = _.values(types);

  bodyItem.isIn(typesValues)
    .withMessage(`invalid '${item}' parameter, has to be one of: [${typesValues.join(', ')}]`);

  return bodyItem;
};

type $ValidBodyEnumOrNull = (
  item: string,
  types: $ObjectType,
  required?: boolean,
) => $Middleware;

// validation chain instance
export const validBodyEnumOrNull: $ValidBodyEnumOrNull = (item, types, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
    true,
  );

  const typesValues: Array<string> = _.values(types);

  bodyItem.custom((value) => _.isNull(value) || _.includes(
    typesValues,
    value,
  ))
    .withMessage(`invalid '${item}' parameter, has to be one of: [${typesValues.join(', ')}] or null`);

  return bodyItem;
};

type $ValidBodyTemplate = (
  item: string,
  types: $ObjectType,
  required?: boolean,
) => $Middleware;

// validation chain instance
export const validBodyTemplate: $ValidBodyTemplate = (item, types, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
  );

  const typesValues: Array<string> = _.keys(types);

  return bodyItem.isIn(typesValues)
    .withMessage(`invalid '${item}' parameter, has to be one of: [${typesValues.join(', ')}]`);
};

type $ValidBodyArray = (
  item: string,
  types?: Array<string>,
  required?: boolean,
) => $Middleware;

// validation chain instance
export const validBodyArray: $ValidBodyArray = (item, types, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
  );

  bodyItem.custom((value) => Array.isArray(value))
    .withMessage(`'${item}' has to be an Array`);

  if (types && Array.isArray(types)) {
    const {
      intersects,
    } = customValidators;

    bodyItem.custom((value) => intersects(
      value,
      types,
    ))
      .withMessage(`invalid '${item}' parameters, has to be in: [${types.join(', ')}]`);
  }

  return bodyItem;
};

export const validBodyDate: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
  );

  const {
    isDate,
  } = customValidators;

  return bodyItem.custom((value) => isDate(value))
    .withMessage(`'${item}' has to be a valid date`);
};

export const validBodyDateOrNull: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
    true,
  );

  const {
    isDate,
  } = customValidators;

  bodyItem.custom((value) => (_.isNull(value) || isDate(value)))
    .withMessage(`'${item}' has to be a date or null`);

  return bodyItem;
};

export const validBodyObject: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
  );

  const {
    isObject,
  } = customValidators;

  return bodyItem.custom((value) => isObject(
    value,
    required || false,
  ))
    .withMessage(`'${item}' has to be an object`);
};

export const validBodyObjectLike: $DefaultValidation = (item, required) => {
  const bodyItem = validBodyBase(
    item,
    required,
  );

  const {
    isObjectLike,
  } = customValidators;

  return bodyItem.custom((value) => isObjectLike(
    value,
    required || false,
  ))
    .withMessage(`'${item}' has to be an object-like`);
};

type $ForbidBodyItem = (item: string) => $Middleware; // validation chain instance

export const forbidBodyItem: $ForbidBodyItem = (item) => {
  const bodyItem = body(item);

  return bodyItem.not().exists().withMessage(`'${item}' is forbidden`);
};
