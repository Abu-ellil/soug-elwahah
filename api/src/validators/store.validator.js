const Joi = require("joi");

const updateStoreSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    "string.min": "اسم المحل يجب أن يحتوي على الأقل 3 أحرف",
    "string.max": "اسم المحل يجب أن لا يزيد عن 100 حرف",
  }),
  description: Joi.string().max(500).optional().messages({
    "string.max": "الوصف يجب أن لا يزيد عن 500 حرف",
  }),
  phone: Joi.string()
    .pattern(/^01[0-9]{9}$/)
    .optional()
    .messages({
      "string.pattern.base": "رقم الهاتف يجب أن يكون بصيغة صحيحة (01xxxxxxxxx)",
    }),
  address: Joi.string().min(5).max(200).optional().messages({
    "string.min": "العنوان يجب أن يحتوي على الأقل 5 أحرف",
    "string.max": "العنوان يجب أن لا يزيد عن 200 حرف",
  }),
  workingHours: Joi.object({
    from: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional()
      .messages({
        "string.pattern.base": "صيغة وقت البدء غير صحيحة (HH:MM)",
      }),
    to: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional()
      .messages({
        "string.pattern.base": "صيغة وقت الانتهاء غير صحيحة (HH:MM)",
      }),
  }).optional(),
});

module.exports = {
  updateStoreSchema,
};
