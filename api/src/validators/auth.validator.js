const Joi = require("joi");

const registerCustomerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.min": "الاسم يجب أن يحتوي على الأقل 3 أحرف",
    "string.max": "الاسم يجب أن لا يزيد عن 50 حرف",
    "any.required": "الاسم مطلوب",
  }),
  phone: Joi.string()
    .pattern(/^01[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "رقم الهاتف يجب أن يكون بصيغة صحيحة (01xxxxxxxxx)",
      "any.required": "رقم الهاتف مطلوب",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "كلمة المرور يجب أن تكون على الأقل 6 أحرف",
    "any.required": "كلمة المرور مطلوبة",
  }),
});

const registerStoreOwnerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.min": "الاسم يجب أن يحتوي على الأقل 3 أحرف",
    "string.max": "الاسم يجب أن لا يزيد عن 50 حرف",
    "any.required": "الاسم مطلوب",
  }),
  phone: Joi.string()
    .pattern(/^01[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "رقم الهاتف يجب أن يكون بصيغة صحيحة (01xxxxxxxxx)",
      "any.required": "رقم الهاتف مطلوب",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "كلمة المرور يجب أن تكون على الأقل 6 أحرف",
    "any.required": "كلمة المرور مطلوبة",
  }),
});

const registerDriverSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.min": "الاسم يجب أن يحتوي على الأقل 3 أحرف",
    "string.max": "الاسم يجب أن لا يزيد عن 50 حرف",
    "any.required": "الاسم مطلوب",
  }),
  phone: Joi.string()
    .pattern(/^01[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "رقم الهاتف يجب أن يكون بصيغة صحيحة (01xxxxxxxxx)",
      "any.required": "رقم الهاتف مطلوب",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "كلمة المرور يجب أن تكون على الأقل 6 أحرف",
    "any.required": "كلمة المرور مطلوبة",
  }),
  vehicleType: Joi.string()
    .valid("motorcycle", "car", "tuktuk")
    .required()
    .messages({
      "any.only": "نوع المركبة غير صحيح",
      "any.required": "نوع المركبة مطلوب",
    }),
  vehicleNumber: Joi.string().min(3).max(20).required().messages({
    "string.min": "رقم المركبة يجب أن يحتوي على الأقل 3 أحرف",
    "string.max": "رقم المركبة يجب أن لا يزيد عن 20 حرف",
    "any.required": "رقم المركبة مطلوب",
  }),
});

const loginSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^01[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "رقم الهاتف يجب أن يكون بصيغة صحيحة (01xxxxxxxxx)",
      "any.required": "رقم الهاتف مطلوب",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "كلمة المرور يجب أن تكون على الأقل 6 أحرف",
    "any.required": "كلمة المرور مطلوبة",
  }),
  role: Joi.string().valid("customer", "store", "driver").required().messages({
    "any.only": "نوع المستخدم غير صحيح",
    "any.required": "نوع المستخدم مطلوب",
  }),
});

module.exports = {
  registerCustomerSchema,
  registerStoreOwnerSchema,
  registerDriverSchema,
  loginSchema,
};
