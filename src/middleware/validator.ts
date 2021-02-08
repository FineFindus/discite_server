import Joi from 'joi';
import * as Express from 'express';
import HttpError from '../error/http_error';

/**
 *
 */
//default options for joi validation
const defaultOptions = {
  abortEarly: false, // include all errors
  allowUnknown: true, // ignore unknown props
  stripUnknown: true, // remove unknown props
};

/**
 * Validate schema with Joi. If the fail automatically send a 400 (Bad Request) response with the errors.
 *
 * @param schema The validating joi schema
 * @param options default options for validating the schema. by the default all errors are included, unknown are ignored and removed
 */
export default (schema: Joi.Schema, options = defaultOptions) => {
  return (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) => {
    // validate request body against schema
    const { error, value } = schema.validate(req.body, options);

    if (error) {
      //create and forward error to error handler
      const responseError = new HttpError(
        400,
        `Validation error: ${error.details.map((i) => i.message).join(', ')}`
      );
      next(responseError);
    } else {
      //set the new validate body as validBody
      // req.validBody = value;
      //replace the old body with the new validated body
      req.body = value;
      next();
    }
  };
};
