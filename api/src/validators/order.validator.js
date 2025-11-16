const Joi = require("joi");

const createOrderSchema = Joi.object({
  storeId: Joi.string().required().messages({
    "string.empty": "معرف المحل مطلوب",
    "any.required": "معرف المحل مطلوب",
  }),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required().messages({
          "string.empty": "معرف المنتج مطلوب",
          "any.required": "معرف المنتج مطلوب",
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          "number.min": "الكمية يجب أن تكون على الأقل 1",
          "number.integer": "الكمية يجب أن تكون عدد صحيح",
          "any.required": "الكمية مطلوبة",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "يجب أن يحتوي الطلب على منتج واحد على الأقل",
      "any.required": "العناصر مطلوبة",
    }),
  address: Joi.object({
    details: Joi.string().min(5).max(200).required().messages({
      "string.min": "تفاصيل العنوان يجب أن تكون على الأقل 5 أحرف",
      "string.max": "تفاصيل العنوان يجب أن لا تزيد عن 200 حرف",
      "any.required": "تفاصيل العنوان مطلوبة",
    }),
    coordinates: Joi.object({
      lat: Joi.number().min(-90).max(90).required().messages({
        "number.min": "خط العرض يجب أن يكون بين -90 و 90",
        "number.max": "خط العرض يجب أن يكون بين -90 و 90",
        "any.required": "خط العرض مطلوب",
      }),
      lng: Joi.number().min(-180).max(180).required().messages({
        "number.min": "خط الطول يجب أن يكون بين -180 و 180",
        "number.max": "خط الطول يجب أن يكون بين -180 و 180",
        "any.required": "خط الطول مطلوب",
      }),
    })
      .required()
      .messages({
        "any.required": "الإحداثيات مطلوبة",
      }),
  })
    .required()
    .messages({
      "any.required": "العنوان مطلوب",
    }),
  paymentMethod: Joi.string()
    .valid("cash", "vodafone_cash", "visa")
    .required()
    .messages({
      "any.only": "وسيلة الدفع غير صحيحة",
      "any.required": "وسيلة الدفع مطلوبة",
    }),
  notes: Joi.string().max(200).optional().messages({
    "string.max": "الملاحظات يجب أن لا تزيد عن 200 حرف",
  }),
});

const cancelOrderSchema = Joi.object({
  cancelReason: Joi.string().max(200).optional().messages({
    "string.max": "سبب الإلغاء يجب أن لا يزيد عن 200 حرف",
  }),
});

module.exports = {
  createOrderSchema,
  cancelOrderSchema,
};
