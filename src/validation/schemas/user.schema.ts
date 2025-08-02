import Joi from 'joi';
import { dateSchema, emailSchema, idSchema, phoneSchema } from './shared.schema';

const userBaseSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: emailSchema,
  phone: phoneSchema,
});

export const userCreateSchema = userBaseSchema;

export const userIdSchema = Joi.object({
  id: idSchema,
});

export const userUpdateSchema = userBaseSchema.append({
  id: idSchema,
});
