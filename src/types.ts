import type {
  AnySchema,
} from 'joi';

export type $Validator = AnySchema;

export type $Schema = (...args: unknown[]) => $Validator;
