import Joi from 'joi';

export const dateSchema = Joi.date().iso().messages({
  'date.iso': 'Invalid date',
});

export const emailSchema = Joi.string().email().messages({
  'string.email': 'Invalid email address',
});

export const idSchema = Joi.string()
  .uuid()
  .messages({
    'string.uuid': 'Invalid ID',
  })
  .required();

// allows optional international prefix and optional dashes or spaces
export const phoneSchema = Joi.string()
  .pattern(/^(\+[1-9]\d{0,3}[-\s]?)?[\d-\s]{7,15}$/)
  .messages({
    'string.pattern.base': 'Invalid phone number',
  });
