const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let message = err.message || "حدث خطأ ما";
  let statusCode = err.statusCode || 500;

  // Handle specific errors
  if (err.name === "ValidationError") {
    message = "خطأ في التحقق من البيانات";
    statusCode = 400;
  } else if (err.name === "CastError") {
    message = "البيانات المقدمة غير صحيحة";
    statusCode = 400;
  } else if (err.code === 11000) {
    message = "البيانات موجودة من قبل";
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
