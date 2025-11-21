/**
 * @file utils/serverless-logger.js - Serverless-compatible logger
 * @description Logger for serverless functions (no file system access)
 */

const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp,
      ...meta
    }));
  },

  error: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.error(JSON.stringify({
      level: 'error',
      message,
      timestamp,
      ...meta
    }));
  },

  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp,
      ...meta
    }));
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.debug(JSON.stringify({
        level: 'debug',
        message,
        timestamp,
        ...meta
      }));
    }
  }
};

module.exports = logger;