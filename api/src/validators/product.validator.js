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
  categoryId: Joi.string().required().messages({
    "string.empty": "تصنيف المنتج مطلوب",
    "any.required": "تصنيف المنتج مطلوب",
  }),
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
  categoryId: Joi.string().optional().messages({
    "string.empty": "تصنيف المنتج لا يمكن أن يكون فارغًا",
  }),
  description: Joi.string().max(500).optional().messages({
    "string.max": "الوصف يجب أن لا يزيد عن 500 حرف",
  }),
  isAvailable: Joi.boolean().optional(),
});

module.exports = {
  addProductSchema,
  updateProductSchema,
};
