const mongoose = require("mongoose");
const ApiResponse = require("../utils/apiResponse");

/**
 * Middleware to validate MongoDB ObjectId parameters
 * @param {string} paramName - The name of the parameter to validate (default: 'id')
 * @returns {Function} Express middleware function
 */
const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id) {
      return res
        .status(400)
        .json(ApiResponse.validationError(`معرف ${paramName} مطلوب`));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(ApiResponse.validationError(`معرف ${paramName} غير صحيح`));
    }

    next();
  };
};

module.exports = validateObjectId;
