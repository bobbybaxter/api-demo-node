import Joi from 'joi';
import { emailSchema, idSchema, phoneSchema } from './shared.schema';

const userBaseSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: emailSchema,
  phone: phoneSchema,
});

export const userCreateSchema = userBaseSchema.fork(['firstName', 'lastName'], (schema) => schema.required());

export const userIdSchema = Joi.object({
  id: idSchema,
});

export const userUpdateSchema = userBaseSchema;
