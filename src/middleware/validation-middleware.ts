import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';

export const validateRequest = (schema: Joi.Schema, property: 'body' | 'query' | 'params') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown properties from the request body
      errors: {
        wrap: {
          label: false,
        },
      },
    });

    if (!error) {
      req[property] = value;
      return next();
    }

    const errorDetails = error.details.map((detail) => ({
      path: detail.path.join('.'),
      message: detail.message,
    }));

    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      message: 'Validation error',
      details: errorDetails,
    });
  };
};
