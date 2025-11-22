const LoginLog = require('../models/LoginLog');

const logLoginAttempt = async (identifier, role, success, userId = null, req = null, errorMessage = null) => {
  try {
    const logEntry = new LoginLog({
      identifier,
      role,
      success,
      userId,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.headers?.['user-agent'] || null,
      errorMessage: success ? null : errorMessage
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error('Error logging login attempt:', error);
    // Don't throw error as logging shouldn't break the login flow
 }
};

const getLoginLogs = async (filters = {}, limit = 50, page = 1) => {
  try {
    const query = {};
    
    if (filters.identifier) {
      query.identifier = { $regex: filters.identifier, $options: 'i' };
    }
    
    if (filters.role) {
      query.role = filters.role;
    }
    
    if (filters.success !== undefined) {
      query.success = filters.success;
    }
    
    if (filters.startDate) {
      query.timestamp = { ...query.timestamp, $gte: new Date(filters.startDate) };
    }
    
    if (filters.endDate) {
      query.timestamp = { ...query.timestamp, $lte: new Date(filters.endDate) };
    }

    const skip = (page - 1) * limit;
    
    const logs = await LoginLog.find(query)
      .populate('userId', 'name phone email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await LoginLog.countDocuments(query);
    
    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching login logs:', error);
    throw error;
  }
};

module.exports = {
  logLoginAttempt,
  getLoginLogs
};