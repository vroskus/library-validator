// Helpers
import express from 'express';
import supertest from 'supertest';

// Enums
import {
  BaseErrorKey,
} from '@vroskus/library-error';

import {
  validateRequest,
  validateResponse,
  z,
} from '../src';

const errorStatus: number = 400;
const successStatus: number = 200;

const schema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.boolean(),
});

const validData = {
  id: 1,
  name: 'string',
  status: true,
};

const invalidData = {
  id: 2,
  name: 2,
};

const app = express();

app.disable('x-powered-by');

app.use(express.json());

describe(
  'validateRequest',
  () => {
    const route = '/test_request';

    app.post(
      route,
      validateRequest({
        body: schema,
      }),
      (req, res) => {
        res.json(req.body);
      },
    );

    const request = supertest(app);

    it(
      'should pass validation',
      async () => {
        const response = await request.post(route).send(validData);

        expect(response.status).toBe(successStatus);
      },
    );

    it(
      'should fail validation',
      async () => {
        const response = await request.post(route).send(invalidData);

        expect(response.status).toBe(errorStatus);
        expect(response.body.key).toBe(BaseErrorKey.requestValidationError);
      },
    );
  },
);

describe(
  'validateResponse',
  () => {
    const route = '/test_response';

    app.post(
      route,
      (req, res) => {
        try {
          const validResponseData = validateResponse(
            req.body,
            schema,
          );

          res.json(validResponseData);
        } catch (error) {
          res.status(errorStatus).json(error);
        }
      },
    );

    const request = supertest(app);

    it(
      'should pass validation',
      async () => {
        const response = await request.post(route).send(validData);

        expect(response.status).toBe(successStatus);
      },
    );

    it(
      'should fail validation',
      async () => {
        const response = await request.post(route).send(invalidData);

        expect(response.status).toBe(errorStatus);
        expect(response.body.key).toBe(BaseErrorKey.responseValidationError);
      },
    );
  },
);
