const Joi = require("joi");

const addProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.min": "اسم المنتج يجب أن يحتوي على الأقل 3 أحرف",
    "string.max": "اسم المنتج يجب أن لا يزيد عن 100 حرف",
    "any.required": "اسم المنتج مطلوب",
  }),
  price: Joi.number().positive().required().messages({
    "number.positive": "السعر يجب أن يكون أكبر من 0",
    "any.required": "السعر مطلوب",
  }),
  stock: Joi.number().integer().min(0).required().messages({
    "number.integer": "الكمية يجب أن تكون رقم صحيح",
    "number.min": "الكمية لا يمكن أن تكون أقل من 0",
    "any.required": "الكمية مطلوبة",
  }),
  category: Joi.string().allow('').optional(),
  categoryId: Joi.string().allow('').optional(),
  description: Joi.string().max(500).optional().messages({
    "string.max": "الوصف يجب أن لا يزيد عن 500 حرف",
  }),
  isAvailable: Joi.boolean().optional(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    "string.min": "اسم المنتج يجب أن يحتوي على الأقل 3 أحرف",
    "string.max": "اسم المنتج يجب أن لا يزيد عن 100 حرف",
  }),
  price: Joi.number().positive().optional().messages({
    "number.positive": "السعر يجب أن يكون أكبر من 0",
  }),
  stock: Joi.number().integer().min(0).optional().messages({
    "number.integer": "الكمية يجب أن تكون رقم صحيح",
    "number.min": "الكمية لا يمكن أن تكون أقل من 0",
  }),
  category: Joi.string().allow('').optional(),
  categoryId: Joi.string().allow('').optional(),
  description: Joi.string().max(500).optional().messages({
    "string.max": "الوصف يجب أن لا يزيد عن 500 حرف",
  }),
  isAvailable: Joi.boolean().optional(),
});

module.exports = {
  addProductSchema,
  updateProductSchema,
};
