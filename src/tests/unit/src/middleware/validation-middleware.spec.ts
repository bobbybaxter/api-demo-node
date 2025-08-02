import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { validateRequest } from '../../../../middleware/validation-middleware';

describe('validateRequest', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create mock functions
    statusMock = vi.fn().mockReturnThis();
    jsonMock = vi.fn().mockReturnThis();
    mockNext = vi.fn();

    // Create mock request and response objects
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('body validation', () => {
    const testSchema = Joi.object({
      name: Joi.string().required(),
      age: Joi.number().min(0).max(120),
      email: Joi.string().email(),
    });

    it('should pass validation and call next() for valid body data', () => {
      mockRequest.body = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      };

      const middleware = validateRequest(testSchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledOnce();
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
    });

    it('should update request body with validated value', () => {
      mockRequest.body = {
        name: 'John Doe',
        age: '30', // String that can be converted to number
        email: 'john@example.com',
        extraField: 'should be removed', // Unknown property
      };

      const middleware = validateRequest(testSchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        name: 'John Doe',
        age: 30, // Joi converts string to number when schema expects number
        email: 'john@example.com',
        // extraField should be stripped due to stripUnknown: true
      });
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should return 400 error for invalid body data', () => {
      mockRequest.body = {
        age: 150, // Invalid age (too high)
        email: 'invalid-email', // Invalid email format
        // name is missing (required field)
      };

      const middleware = validateRequest(testSchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return all validation errors when abortEarly is false', () => {
      mockRequest.body = {
        age: -5, // Invalid age (negative)
        email: 'not-an-email', // Invalid email
        // name missing (required)
      };

      const middleware = validateRequest(testSchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'name',
            message: expect.stringContaining('required'),
          }),
          expect.objectContaining({
            path: 'age',
            message: expect.any(String),
          }),
          expect.objectContaining({
            path: 'email',
            message: expect.any(String),
          }),
        ]),
      });
    });
  });

  describe('query validation', () => {
    const querySchema = Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10),
      search: Joi.string().optional(),
    });

    it('should pass validation for valid query parameters', () => {
      mockRequest.query = {
        page: '2',
        limit: '20',
        search: 'test',
      };

      const middleware = validateRequest(querySchema, 'query');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledOnce();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should apply default values for missing query parameters', () => {
      mockRequest.query = {
        search: 'test',
        // page and limit missing, should get defaults
      };

      const middleware = validateRequest(querySchema, 'query');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.query).toEqual({
        page: 1, // default value applied
        limit: 10, // default value applied
        search: 'test',
      });
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should return 400 for invalid query parameters', () => {
      mockRequest.query = {
        page: '0', // Invalid (below minimum)
        limit: '150', // Invalid (above maximum)
      };

      const middleware = validateRequest(querySchema, 'query');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'page',
            message: expect.any(String),
          }),
          expect.objectContaining({
            path: 'limit',
            message: expect.any(String),
          }),
        ]),
      });
    });
  });

  describe('params validation', () => {
    const paramsSchema = Joi.object({
      id: Joi.string().uuid().required(),
      type: Joi.string().valid('user', 'admin').required(),
    });

    it('should pass validation for valid params', () => {
      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'user',
      };

      const middleware = validateRequest(paramsSchema, 'params');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledOnce();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid params', () => {
      mockRequest.params = {
        id: 'invalid-uuid',
        type: 'invalid-type',
      };

      const middleware = validateRequest(paramsSchema, 'params');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'id',
            message: expect.any(String),
          }),
          expect.objectContaining({
            path: 'type',
            message: expect.any(String),
          }),
        ]),
      });
    });
  });

  describe('schema options behavior', () => {
    it('should strip unknown properties from request data', () => {
      const strictSchema = Joi.object({
        name: Joi.string().required(),
      });

      mockRequest.body = {
        name: 'John',
        unknownField: 'should be removed',
        anotherUnknown: 123,
      };

      const middleware = validateRequest(strictSchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        name: 'John',
        // unknownField and anotherUnknown should be stripped
      });
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should handle nested object validation', () => {
      const nestedSchema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          details: Joi.object({
            age: Joi.number().required(),
          }).required(),
        }).required(),
      });

      mockRequest.body = {
        user: {
          name: 'John',
          details: {
            // age missing (required)
          },
        },
      };

      const middleware = validateRequest(nestedSchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'user.details.age',
            message: expect.any(String),
          }),
        ]),
      });
    });

    it('should handle array validation', () => {
      const arraySchema = Joi.object({
        items: Joi.array()
          .items(
            Joi.object({
              id: Joi.number().required(),
              name: Joi.string().required(),
            }),
          )
          .min(1)
          .required(),
      });

      mockRequest.body = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2 }, // name missing
          { name: 'Item 3' }, // id missing
        ],
      };

      const middleware = validateRequest(arraySchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation error',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'items.1.name',
            message: expect.any(String),
          }),
          expect.objectContaining({
            path: 'items.2.id',
            message: expect.any(String),
          }),
        ]),
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty request data', () => {
      const schema = Joi.object({
        name: Joi.string().optional(),
      });

      mockRequest.body = {};

      const middleware = validateRequest(schema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should handle null request data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      mockRequest.body = null;

      const middleware = validateRequest(schema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    });

    it('should handle undefined request data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      mockRequest.body = undefined;

      const middleware = validateRequest(schema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Joi treats undefined as an empty object {} when stripUnknown is true
      // Since all fields are optional in this case, validation passes
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should format error details correctly', () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        age: Joi.number().min(18).required(),
      });

      mockRequest.body = {
        email: 'invalid-email',
        age: 15,
      };

      const middleware = validateRequest(schema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.details).toHaveLength(2);
      expect(callArgs.details[0]).toHaveProperty('path');
      expect(callArgs.details[0]).toHaveProperty('message');
      expect(callArgs.details[1]).toHaveProperty('path');
      expect(callArgs.details[1]).toHaveProperty('message');
    });
  });

  describe('integration with real schemas', () => {
    it('should work with user create schema patterns', () => {
      const userSchema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string()
          .pattern(/^(\+[1-9]\d{0,3}[-\s]?)?[\d-\s]{7,15}$/)
          .required(),
      });

      mockRequest.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-123-4567',
      };

      const middleware = validateRequest(userSchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledOnce();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should work with UUID validation patterns', () => {
      const idSchema = Joi.object({
        id: Joi.string().uuid().required(),
      });

      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const middleware = validateRequest(idSchema, 'params');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledOnce();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});
