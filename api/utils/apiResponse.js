// Standardized API response utility
class ApiResponse {
  // Success response
  static success(message = 'تم بنجاح', data = null, statusCode = 200) {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  // Error response
  static error(message = 'حدث خطأ', errors = null, statusCode = 500) {
    return {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  // Success response with res object
  static successResponse(res, data = null, message = 'تم بنجاح', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Error response with res object
  static errorResponse(res, message = 'حدث خطأ', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  // Validation error response
  static validationError(res, errors, message = 'بيانات غير صحيحة') {
    return res.status(400).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  // Unauthorized response
  static unauthorized(res, message = 'غير مصرح لك بالوصول') {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Forbidden response
  static forbidden(res, message = 'ممنوع الوصول') {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Not found response
  static notFound(res, message = 'غير موجود') {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Paginated response
  static paginated(res, data, pagination, message = 'تم جلب البيانات بنجاح') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: pagination.limit,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage
      },
      timestamp: new Date().toISOString()
    });
  }

  // Created response
  static created(res, data, message = 'تم الإنشاء بنجاح') {
    return res.status(201).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // No content response
  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;