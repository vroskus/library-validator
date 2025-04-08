/* eslint-disable sonarjs/no-duplicate-string */

// Global Types
import type {
  Request as $Request,
  Response as $Response,
} from 'express';

// Helpers
import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';
import _ from 'lodash';
import {
  BaseErrorKey,
  errorResponse,
} from '@vroskus/library-error';

import validateRequest, {
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
} from '../src/request';

const successStatus: number = 200;
const errorStatus: number = 400;
const oneValue: number = 1;

describe(
  'validationChain',
  () => {
    let app;

    const defaultCompleteHandler = (
      req: $Request,
      res: $Response,
      location?: 'body' | 'params',
      value?: unknown,
    ) => {
      try {
        const result = validateRequest(req);

        if (location && value) {
          expect(result[location]).toEqual(value);
        }

        res.json(true);
      } catch (error) {
        errorResponse(
          res,
          error,
        );
      }
    };

    const defaultBodyValidationChainTest = ({
      item,
      itemInvalidValue,
      itemValue,
      validateNull,
      validationChain,
    }: {
      item: string;
      itemInvalidValue: unknown;
      itemValue: unknown;
      validateNull?: boolean;
      validationChain: (required: boolean) => express.RequestHandler<unknown>;
    }) => {
      it(
        'should validate undefined optional value',
        (done) => {
          app.post(
            '/',
            validationChain(false),
            (req: $Request, res: $Response) => {
              defaultCompleteHandler(
                req,
                res,
                'body',
                {
                },
              );
            },
          );

          request(app)
            .post('/')
            .expect(successStatus)
            .end(done);
        },
      );

      it(
        'should validate defined correct value',
        (done) => {
          const payload = {
            [item]: itemValue,
          };

          app.post(
            '/',
            validationChain(true),
            (req: $Request, res: $Response) => {
              defaultCompleteHandler(
                req,
                res,
                'body',
                payload,
              );
            },
          );

          request(app)
            .post('/')
            .send(payload)
            .expect(successStatus)
            .end(done);
        },
      );

      it(
        'should invalidate defined incorrect case value',
        (done) => {
          app.post(
            '/',
            validationChain(true),
            (req: $Request, res: $Response) => {
              defaultCompleteHandler(
                req,
                res,
                'body',
                {
                },
              );
            },
          );

          request(app)
            .post('/')
            .send({
              [_.capitalize(item)]: itemValue,
            })
            .expect(errorStatus)
            .expect((res) => {
              expect(res.body.key).toEqual(BaseErrorKey.requestValidationError);
            })
            .end(done);
        },
      );

      it(
        'should invalidate undefined value',
        (done) => {
          app.post(
            '/',
            validationChain(true),
            (req: $Request, res: $Response) => {
              defaultCompleteHandler(
                req,
                res,
              );
            },
          );

          request(app)
            .post('/')
            .expect(errorStatus)
            .expect((res) => {
              expect(res.body.key).toEqual(BaseErrorKey.requestValidationError);
            })
            .end(done);
        },
      );

      it(
        'should invalidate defined invalid value',
        (done) => {
          app.post(
            '/',
            validationChain(true),
            (req: $Request, res: $Response) => {
              defaultCompleteHandler(
                req,
                res,
              );
            },
          );

          request(app)
            .post('/')
            .send({
              [item]: itemInvalidValue,
            })
            .expect(errorStatus)
            .expect((res) => {
              expect(res.body.key).toEqual(BaseErrorKey.requestValidationError);
            })
            .end(done);
        },
      );

      if (validateNull) {
        it(
          'should validate defined null value',
          (done) => {
            const payload = {
              [item]: null,
            };

            app.post(
              '/',
              validationChain(false),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                  'body',
                  payload,
                );
              },
            );

            request(app)
              .post('/')
              .send({
                [item]: null,
              })
              .expect(successStatus)
              .end(done);
          },
        );

        it(
          'should validate defined null value (required)',
          (done) => {
            const payload = {
              [item]: null,
            };

            app.post(
              '/',
              validationChain(true),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                  'body',
                  payload,
                );
              },
            );

            request(app)
              .post('/')
              .send({
                [item]: null,
              })
              .expect(successStatus)
              .end(done);
          },
        );
      }
    };

    beforeEach(() => {
      app = express();
      app.use(bodyParser.json());
    });

    describe(
      'validParamsBase',
      () => {
        const item = 'item';

        it(
          'should validate undefined optional params',
          (done) => {
            app.post(
              `{/:${item}}`,
              validParamsString(item),
              (req: $Request, res: $Response) => {
                try {
                  const {
                    params,
                  } = validateRequest(req);

                  expect(params).toEqual(expect.not.objectContaining({
                    id: undefined,
                  }));
                } catch (error) {
                  errorResponse(
                    res,
                    error,
                  );
                }

                res.send();
              },
            );

            request(app)
              .post('/')
              .expect(successStatus)
              .end(done);
          },
        );

        it(
          'should throw an error on validation if required params are undefined',
          (done) => {
            app.post(
              `{/:${item}}`,
              validParamsString(
                item,
                true,
              ),
              (req: $Request, res: $Response) => {
                try {
                  validateRequest(req);
                } catch (error) {
                  errorResponse(
                    res,
                    error,
                  );
                }

                res.send();
              },
            );

            request(app)
              .post('/')
              .expect(errorStatus)
              .expect((res) => {
                expect(res.body.key).toEqual(BaseErrorKey.requestValidationError);
              })
              .end(done);
          },
        );
      },
    );

    describe(
      'validBodyBase',
      () => {
        it(
          'should filter explicitly undefined body params',
          (done) => {
            const item = 'item';
            const itemValue = undefined;

            app.post(
              '/',
              validBodyObject(item),
              (req: $Request, res: $Response) => {
                try {
                  const {
                    body,
                  } = validateRequest(req);

                  expect(body).toEqual(expect.not.objectContaining({
                    [item]: itemValue,
                  }));
                } catch (error) {
                  errorResponse(
                    res,
                    error,
                  );
                }

                res.send();
              },
            );

            request(app)
              .post('/')
              .send({
                [item]: itemValue,
              })
              .expect(successStatus)
              .end(done);
          },
        );

        describe(
          'with validBodyObject',
          () => {
            const deepPayload = Object.freeze({
              p1: {
                a: {
                },
                b: {
                },
              },
              p2: {
                a: {
                  x: 'x',
                },
              },
              p3: {
                a: undefined,
                b: undefined,
              },
            });

            it(
              'should return only validated (and optional) nested body objects while marinating the same path',
              (done) => {
                app.post(
                  '/',
                  validBodyObject('*.a'),
                  /* eslint-disable-next-line sonarjs/no-nested-functions */
                  (req: $Request, res: $Response) => {
                    try {
                      const {
                        body,
                      } = validateRequest(req);

                      expect(body).toEqual(expect.objectContaining({
                        p1: {
                          a: {
                          },
                        },
                        p2: {
                          a: {
                            x: 'x',
                          },
                        },
                        p3: {
                          a: undefined,
                        },
                      }));
                    } catch (error) {
                      errorResponse(
                        res,
                        error,
                      );
                    }

                    res.send();
                  },
                );

                request(app)
                  .post('/')
                  .send(deepPayload)
                  .expect(successStatus)
                  .end(done);
              },
            );
          },
        );
      },
    );

    describe(
      'validParamsString',
      () => {
        const item = 'item';
        const itemValue = 'value';

        it(
          'should validate undefined optional value',
          (done) => {
            app.post(
              `{/:${item}}`,
              validParamsString(item),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                  'params',
                  {
                  },
                );
              },
            );

            request(app)
              .post('/')
              .expect(successStatus)
              .end(done);
          },
        );

        it(
          'should validate defined correct value',
          (done) => {
            app.post(
              `/:${item}`,
              validParamsString(
                item,
                true,
              ),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                  'params',
                  {
                    [item]: itemValue,
                  },
                );
              },
            );

            request(app)
              .post(`/${itemValue}`)
              .expect(successStatus)
              .end(done);
          },
        );

        it(
          'should invalidate undefined value',
          (done) => {
            app.post(
              `{/:${item}}`,
              validParamsString(
                item,
                true,
              ),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                );
              },
            );

            request(app)
              .post('/')
              .expect(errorStatus)
              .expect((res) => {
                expect(res.body.key).toEqual(BaseErrorKey.requestValidationError);
              })
              .end(done);
          },
        );
      },
    );

    describe(
      'validParamsId',
      () => {
        const item = 'item';
        const itemValue = 'c51c80c2-66a1-442a-91e2-4f55b4256a72';
        const itemInvalidValue = 'invalidValue';

        it(
          'should validate undefined optional value',
          (done) => {
            app.post(
              `{/:${item}}`,
              validParamsId(item),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                  'params',
                  {
                  },
                );
              },
            );

            request(app)
              .post('/')
              .expect(successStatus)
              .end(done);
          },
        );

        it(
          'should validate defined correct value',
          (done) => {
            app.post(
              `{/:${item}}`,
              validParamsId(
                item,
                true,
              ),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                  'params',
                  {
                    [item]: itemValue,
                  },
                );
              },
            );

            request(app)
              .post(`/${itemValue}`)
              .expect(successStatus)
              .end(done);
          },
        );

        it(
          'should invalidate defined invalid value',
          (done) => {
            app.post(
              `/:${item}`,
              validParamsId(
                'id',
                true,
              ),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                );
              },
            );

            request(app)
              .post(`/${itemInvalidValue}`)
              .expect(errorStatus)
              .expect((res) => {
                expect(res.body.key).toEqual(BaseErrorKey.requestValidationError);
              })
              .end(done);
          },
        );
      },
    );

    describe(
      'validParamsEnum',
      () => {
        const item = 'item';
        const itemValue = 'value';
        const invlidItem = 'invalidItem';
        const itemInvalidValue = 'invlidValue';
        const itemTypes = {
          [itemValue]: itemValue,
        };

        it(
          'should validate undefined optional value',
          (done) => {
            app.post(
              `{/:${item}}`,
              validParamsEnum(
                item,
                itemTypes,
              ),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                  'params',
                  {
                  },
                );
              },
            );

            request(app)
              .post('/')
              .expect(successStatus)
              .end(done);
          },
        );

        it(
          'should validate defined correct value',
          (done) => {
            app.post(
              `/:${item}`,
              validParamsEnum(
                item,
                itemTypes,
                true,
              ),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                  'params',
                  {
                    [item]: itemValue,
                  },
                );
              },
            );

            request(app)
              .post(`/${itemValue}`)
              .expect(successStatus)
              .end(done);
          },
        );

        it(
          'should invalidate defined invalid value',
          (done) => {
            app.post(
              `/:${item}`,
              validParamsEnum(
                item,
                itemTypes,
                true,
              ),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                );
              },
            );

            request(app)
              .post(`/${itemInvalidValue}`)
              .expect(errorStatus)
              .expect((res) => {
                expect(res.body.key).toEqual(BaseErrorKey.requestValidationError);
              })
              .end(done);
          },
        );

        it(
          'should return validated defined optional params',
          (done) => {
            app.post(
              `{/:${item}}`,
              validParamsEnum(
                item,
                itemTypes,
              ),
              (req: $Request, res: $Response) => {
                try {
                  const {
                    params,
                  } = validateRequest(req);

                  expect(params).toEqual(expect.objectContaining({
                    [item]: itemValue,
                  }));
                } catch (error) {
                  errorResponse(
                    res,
                    error,
                  );
                }

                res.send();
              },
            );

            request(app)
              .post(`/${itemValue}`)
              .expect(successStatus)
              .end(done);
          },
        );

        it(
          'should return only validated params',
          (done) => {
            app.post(
              `/:${item}/:${invlidItem}`,
              validParamsEnum(
                item,
                itemTypes,
                true,
              ),
              (req: $Request, res: $Response) => {
                try {
                  const {
                    params,
                  } = validateRequest(req);

                  expect(params).toEqual(expect.objectContaining({
                    [item]: itemValue,
                  }));
                  expect(params).toEqual(expect.not.objectContaining({
                    [invlidItem]: itemInvalidValue,
                  }));
                } catch (error) {
                  errorResponse(
                    res,
                    error,
                  );
                }

                res.send();
              },
            );

            request(app)
              .post(`/${itemValue}/${itemInvalidValue}`)
              .expect(successStatus)
              .end(done);
          },
        );
      },
    );

    describe(
      'validBodyString',
      () => {
        const item = 'item';
        const itemValue = 'value';
        const itemInvalidValue = 1;

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyString(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyStringOrNull',
      () => {
        const item = 'item';
        const itemValue = 'value';
        const itemInvalidValue = 1;

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validateNull: true,
          validationChain: (required: boolean) => validBodyStringOrNull(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyNumber',
      () => {
        const item = 'item';
        const itemValue = 1;
        const itemInvalidValue = 'invalidValue';

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyNumber(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyNumberOrNull',
      () => {
        const item = 'item';
        const itemValue = 1;
        const itemInvalidValue = 'invalidValue';

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validateNull: true,
          validationChain: (required: boolean) => validBodyNumberOrNull(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyDecimal',
      () => {
        const item = 'item';
        const itemValue = 1.5;
        const itemInvalidValue = 'invalidValue';

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyDecimal(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyDecimalOrNull',
      () => {
        const item = 'item';
        const itemValue = 1.5;
        const itemInvalidValue = 'invalidValue';

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validateNull: true,
          validationChain: (required: boolean) => validBodyDecimalOrNull(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyBoolean',
      () => {
        const item = 'item';
        const itemValue = 'true';
        const itemInvalidValue = 'invalidValue';

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyBoolean(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyEmail',
      () => {
        const item = 'item';
        const itemValue = 'email@email.com';
        const itemInvalidValue = 'invalidValue';

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyEmail(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyEmailOrNull',
      () => {
        const item = 'item';
        const itemValue = 'email@email.com';
        const itemInvalidValue = 'invalidValue';

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validateNull: true,
          validationChain: (required: boolean) => validBodyEmailOrNull(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyPin',
      () => {
        const item = 'item';
        const itemValue = '0000';
        const itemInvalidValue = '000a';

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyPin(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyId',
      () => {
        const item = 'item';
        const itemValue = 'c51c80c2-66a1-442a-91e2-4f55b4256a72';
        const itemInvalidValue = 'invalidValue';

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyId(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyIdOrNull',
      () => {
        const item = 'item';
        const itemValue = 'c51c80c2-66a1-442a-91e2-4f55b4256a72';
        const itemInvalidValue = 'invalidValue';

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validateNull: true,
          validationChain: (required: boolean) => validBodyIdOrNull(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyDate',
      () => {
        const item = 'item';
        const itemValue = '2011-10-05T14:48:00.000Z';
        const itemInvalidValue = 'invalidValue';

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyDate(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyDateOrNull',
      () => {
        const item = 'item';
        const itemValue = '2011-10-05T14:48:00.000Z';
        const itemInvalidValue = 'invalidValue';

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validateNull: true,
          validationChain: (required: boolean) => validBodyDateOrNull(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyEnum',
      () => {
        const item = 'item';
        const itemValue = 'value';
        const itemInvalidValue = 'invalidValue';
        const itemTypes = {
          [itemValue]: itemValue,
        };

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyEnum(
            item,
            itemTypes,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyEnumOrNull',
      () => {
        const item = 'item';
        const itemValue = 'value';
        const itemInvalidValue = 'invalidValue';
        const itemTypes = {
          [itemValue]: itemValue,
        };

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validateNull: true,
          validationChain: (required: boolean) => validBodyEnumOrNull(
            item,
            itemTypes,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyArray',
      () => {
        const item = 'item';
        const itemValue = ['value'];
        const itemInvalidValue = ['invalidValue'];
        const itemTypes = [itemValue[0]];

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyArray(
            item,
            itemTypes,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyTemplate',
      () => {
        const item = 'item';
        const itemValue = 'value';
        const itemInvalidValue = 'invalidValue';
        const itemTypes = {
          [itemValue]: itemValue,
        };

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyTemplate(
            item,
            itemTypes,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyObject',
      () => {
        const item = 'item';
        const itemValue = {
          key: 'value',
        };
        const itemInvalidValue = 123;

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyObject(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyObjectLike (object)',
      () => {
        const item = 'item';
        const itemValue = {
          key: 'value',
        };
        const itemInvalidValue = 123;

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyObjectLike(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'validBodyObjectLike (array)',
      () => {
        const item = 'item';
        const itemValue = ['value'];
        const itemInvalidValue = 123;

        defaultBodyValidationChainTest({
          item,
          itemInvalidValue,
          itemValue,
          validationChain: (required: boolean) => validBodyObjectLike(
            item,
            required,
          ),
        });
      },
    );

    describe(
      'forbidBodyItem',
      () => {
        const item = 'item';
        const itemValue = 'value';

        it(
          'should validate undefined optional value',
          (done) => {
            app.post(
              '/',
              forbidBodyItem(item),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                );
              },
            );

            request(app)
              .post('/')
              .expect(successStatus)
              .end(done);
          },
        );

        it(
          'should invalidate defined value',
          (done) => {
            app.post(
              '/',
              forbidBodyItem(item),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                );
              },
            );

            request(app)
              .post('/')
              .send({
                [item]: itemValue,
              })
              .expect(errorStatus)
              .expect((res) => {
                expect(res.body.key).toEqual(BaseErrorKey.requestValidationError);
                expect(res.body.data.errors).toHaveLength(oneValue);
              })
              .end(done);
          },
        );

        it(
          'should invalidate defined value (null)',
          (done) => {
            app.post(
              '/',
              forbidBodyItem(item),
              (req: $Request, res: $Response) => {
                defaultCompleteHandler(
                  req,
                  res,
                );
              },
            );

            request(app)
              .post('/')
              .send({
                [item]: itemValue,
              })
              .expect(errorStatus)
              .expect((res) => {
                expect(res.body.key).toEqual(BaseErrorKey.requestValidationError);
                expect(res.body.data.errors).toHaveLength(oneValue);
              })
              .end(done);
          },
        );
      },
    );
  },
);
