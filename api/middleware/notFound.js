const ApiResponse = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  res.status(404).json(
    ApiResponse.error(
      `Route ${req.originalUrl} not found`,
      null,
      404
    )
  );
};

module.exports = notFound;