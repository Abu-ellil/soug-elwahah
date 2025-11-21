const crypto = require('crypto');
const User = require('../models/User');

// Generate OTP
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

// Generate secure OTP using crypto
const generateSecureOTP = (length = 6) => {
  const max = Math.pow(10, length) - 1;
  const min = Math.pow(10, length - 1);
  
  let otp;
  do {
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0);
    otp = (randomNumber % (max - min + 1)) + min;
  } while (otp.toString().length !== length);
  
  return otp.toString();
};

// Hash OTP for storage
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp.toString()).digest('hex');
};

// Generate OTP expiry time
const generateOTPExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

// Create and save OTP for user
const createOTPForUser = async (userId, type = 'verification', length = 6, expiryMinutes = 10) => {
  try {
    const otp = generateSecureOTP(length);
    const hashedOTP = hashOTP(otp);
    const expiresAt = generateOTPExpiry(expiryMinutes);

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    // Store OTP data
    user.otp = {
      code: hashedOTP,
      type: type,
      expiresAt: expiresAt,
      attempts: 0,
      createdAt: new Date()
    };

    await user.save({ validateBeforeSave: false });

    return {
      otp: otp, // Return plain OTP for sending
      expiresAt: expiresAt,
      type: type
    };
  } catch (error) {
    console.error('Error creating OTP:', error);
    throw error;
  }
};

// Verify OTP
const verifyOTP = async (userId, inputOTP, type = 'verification') => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        message: 'المستخدم غير موجود'
      };
    }

    // Check if OTP exists
    if (!user.otp || !user.otp.code) {
      return {
        success: false,
        message: 'لم يتم إرسال رمز التحقق'
      };
    }

    // Check OTP type
    if (user.otp.type !== type) {
      return {
        success: false,
        message: 'نوع رمز التحقق غير صحيح'
      };
    }

    // Check if OTP is expired
    if (user.otp.expiresAt < new Date()) {
      // Clear expired OTP
      user.otp = undefined;
      await user.save({ validateBeforeSave: false });
      
      return {
        success: false,
        message: 'انتهت صلاحية رمز التحقق'
      };
    }

    // Check attempts limit
    if (user.otp.attempts >= 5) {
      // Clear OTP after too many attempts
      user.otp = undefined;
      await user.save({ validateBeforeSave: false });
      
      return {
        success: false,
        message: 'تم تجاوز الحد المسموح من المحاولات'
      };
    }

    // Hash input OTP and compare
    const hashedInputOTP = hashOTP(inputOTP);
    
    if (hashedInputOTP !== user.otp.code) {
      // Increment attempts
      user.otp.attempts += 1;
      await user.save({ validateBeforeSave: false });
      
      return {
        success: false,
        message: 'رمز التحقق غير صحيح',
        attemptsLeft: 5 - user.otp.attempts
      };
    }

    // OTP is valid - clear it and return success
    user.otp = undefined;
    
    // Update user based on OTP type
    if (type === 'verification') {
      user.isVerified = true;
      user.verifiedAt = new Date();
    } else if (type === 'phone_verification') {
      user.phoneVerified = true;
      user.phoneVerifiedAt = new Date();
    }

    await user.save({ validateBeforeSave: false });

    return {
      success: true,
      message: 'تم التحقق بنجاح'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'خطأ في التحقق من الرمز'
    };
  }
};

// Check if user can request new OTP
const canRequestNewOTP = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return {
        canRequest: false,
        message: 'المستخدم غير موجود'
      };
    }

    // If no OTP exists, can request
    if (!user.otp || !user.otp.createdAt) {
      return {
        canRequest: true
      };
    }

    // Check if enough time has passed (1 minute cooldown)
    const timeSinceLastOTP = Date.now() - user.otp.createdAt.getTime();
    const cooldownPeriod = 60 * 1000; // 1 minute

    if (timeSinceLastOTP < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastOTP) / 1000);
      return {
        canRequest: false,
        message: `يمكنك طلب رمز جديد بعد ${remainingTime} ثانية`,
        remainingTime: remainingTime
      };
    }

    return {
      canRequest: true
    };
  } catch (error) {
    console.error('Error checking OTP request eligibility:', error);
    return {
      canRequest: false,
      message: 'خطأ في التحقق من إمكانية الطلب'
    };
  }
};

// Clean expired OTPs (utility function for cleanup job)
const cleanExpiredOTPs = async () => {
  try {
    const result = await User.updateMany(
      {
        'otp.expiresAt': { $lt: new Date() }
      },
      {
        $unset: { otp: 1 }
      }
    );

    console.log(`Cleaned ${result.modifiedCount} expired OTPs`);
    return result.modifiedCount;
  } catch (error) {
    console.error('Error cleaning expired OTPs:', error);
    return 0;
  }
};

// Send OTP via SMS (placeholder - integrate with SMS service)
const sendOTPViaSMS = async (phone, otp, type = 'verification') => {
  try {
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`Sending OTP ${otp} to ${phone} for ${type}`);
    
    // For development, just log the OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 SMS OTP for ${phone}: ${otp}`);
      return {
        success: true,
        message: 'تم إرسال رمز التحقق'
      };
    }

    // In production, implement actual SMS sending
    // Example with a hypothetical SMS service:
    /*
    const smsService = require('./smsService');
    const message = `رمز التحقق الخاص بك في السوق: ${otp}. صالح لمدة 10 دقائق.`;
    
    const result = await smsService.send({
      to: phone,
      message: message
    });
    
    if (result.success) {
      return {
        success: true,
        message: 'تم إرسال رمز التحقق'
      };
    } else {
      throw new Error(result.error);
    }
    */

    return {
      success: true,
      message: 'تم إرسال رمز التحقق'
    };
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    return {
      success: false,
      message: 'فشل في إرسال رمز التحقق'
    };
  }
};

// Send OTP via Email (placeholder - integrate with email service)
const sendOTPViaEmail = async (email, otp, type = 'verification') => {
  try {
    // TODO: Integrate with email service
    console.log(`Sending OTP ${otp} to ${email} for ${type}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Email OTP for ${email}: ${otp}`);
      return {
        success: true,
        message: 'تم إرسال رمز التحقق'
      };
    }

    // In production, implement actual email sending
    return {
      success: true,
      message: 'تم إرسال رمز التحقق'
    };
  } catch (error) {
    console.error('Error sending Email OTP:', error);
    return {
      success: false,
      message: 'فشل في إرسال رمز التحقق'
    };
  }
};

// Get OTP status for user
const getOTPStatus = async (userId) => {
  try {
    const user = await User.findById(userId).select('otp');
    if (!user) {
      return null;
    }

    if (!user.otp) {
      return {
        hasOTP: false
      };
    }

    return {
      hasOTP: true,
      type: user.otp.type,
      expiresAt: user.otp.expiresAt,
      attempts: user.otp.attempts,
      isExpired: user.otp.expiresAt < new Date(),
      remainingAttempts: Math.max(0, 5 - user.otp.attempts)
    };
  } catch (error) {
    console.error('Error getting OTP status:', error);
    return null;
  }
};

module.exports = {
  generateOTP,
  generateSecureOTP,
  hashOTP,
  generateOTPExpiry,
  createOTPForUser,
  verifyOTP,
  canRequestNewOTP,
  cleanExpiredOTPs,
  sendOTPViaSMS,
  sendOTPViaEmail,
  getOTPStatus
};