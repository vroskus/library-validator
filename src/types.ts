import type {
  AnySchema,
} from 'joi';

/* eslint-disable perfectionist/sort-modules */

export type $Validator = AnySchema;

export type $Schema = (...args: unknown[]) => $Validator;
