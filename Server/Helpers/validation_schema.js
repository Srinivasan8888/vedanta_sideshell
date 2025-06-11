import Joi from 'joi';

const authSchema = Joi.object({
    name: Joi.string().lowercase().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
    phoneno: Joi.string().length(10).required(),
    role: Joi.string().valid('admin', 'user', 'superadmin').required(),
    empid: Joi.string().required(),
  });

export { authSchema };