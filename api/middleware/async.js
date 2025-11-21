/**
 * @file middleware/async.js - Async middleware wrapper
 * @description مساعد لتحويل دوال async إلى شكل يمكن استخدامه مع Express
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;