const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const { logLoginAttempt } = require("../services/loginLog.service");
const User = require("../models/User");
const StoreOwner = require("../models/StoreOwner");
const Driver = require("../models/Driver");
const SuperAdmin = require("../models/SuperAdmin");

class BaseAuthController {
  constructor(userModel, role) {
    this.userModel = userModel;
    this.role = role;
  }

  // Common utility to check if phone is unique across all user types
  async checkPhoneUniqueness(phone, excludeId = null) {
    const queries = [
      User.findOne({ phone }),
      StoreOwner.findOne({ phone }),
      Driver.findOne({ phone }),
      SuperAdmin.findOne({ phone }),
    ];

    const [existingUser, existingOwner, existingDriver, existingAdmin] = await Promise.all(queries);

    // If excludeId is provided, allow if it's the same user
    if (excludeId) {
      if (existingUser && existingUser._id.toString() !== excludeId) return false;
      if (existingOwner && existingOwner._id.toString() !== excludeId) return false;
      if (existingDriver && existingDriver._id.toString() !== excludeId) return false;
      if (existingAdmin && existingAdmin._id.toString() !== excludeId) return false;
      return true;
    }

    return !existingUser && !existingOwner && !existingDriver && !existingAdmin;
  }

  // Hash password
  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  // Validate password
  async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Generate token
  generateUserToken(userId, phone) {
    return generateToken({
      userId,
      role: this.role,
      phone,
    });
  }

  // Log login attempt
  async logLogin(phone, success, userId = null, req, message = "") {
    await logLoginAttempt(phone, this.role, success, userId, req, message);
  }

  // Common registration logic
  async register(req, res, additionalFields = {}) {
    try {
      const { name, phone, password } = req.body;

      // Check phone uniqueness
      const isPhoneUnique = await this.checkPhoneUniqueness(phone);
      if (!isPhoneUnique) {
        return res.status(400).json({
          success: false,
          message: "رقم الهاتف مستخدم من قبل"
        });
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const userData = {
        name,
        phone,
        password: hashedPassword,
        ...additionalFields
      };

      const user = new this.userModel(userData);
      await user.save();

      // Generate token
      const token = this.generateUserToken(user._id, user.phone);

      // Log successful registration
      await this.logLogin(phone, true, user._id, req, "Registration successful");

      return res.status(201).json({
        success: true,
        data: {
          user: this.formatUserResponse(user),
          token,
        },
        message: this.getRegistrationSuccessMessage(),
      });
    } catch (error) {
      console.error(`${this.role} registration error:`, error);
      res.status(500).json({ success: false, message: "خطأ في الخادم" });
    }
  }

  // Common login logic
  async login(req, res) {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        await this.logLogin(phone, false, null, req, "Missing required fields");
        return res.status(400).json({
          success: false,
          message: "يرجى تعبئة جميع الحقول"
        });
      }

      const user = await this.userModel.findOne({ phone }).maxTimeMS(10000);

      if (!user) {
        await this.logLogin(phone, false, null, req, "User not found");
        return res.status(401).json({
          success: false,
          message: "Phone number or password is incorrect"
        });
      }

      // Check if user is active
      if (!user.isActive) {
        await this.logLogin(phone, false, user._id, req, "Account not active");
        return res.status(401).json({
          success: false,
          message: "الحساب غير نشط"
        });
      }

      // Validate password
      const isPasswordValid = await this.validatePassword(password, user.password);
      if (!isPasswordValid) {
        await this.logLogin(phone, false, user._id, req, "Invalid password");
        return res.status(401).json({
          success: false,
          message: "Phone number or password is incorrect"
        });
      }

      // Generate token
      const token = this.generateUserToken(user._id, user.phone);

      // Log successful login
      await this.logLogin(phone, true, user._id, req);

      res.status(200).json({
        success: true,
        data: {
          user: this.formatUserResponse(user),
          token,
          role: this.role,
        },
        message: "تم تسجيل الدخول بنجاح",
      });
    } catch (error) {
      console.error(`${this.role} login error:`, error);
      res.status(500).json({ success: false, message: "خطأ في الخادم" });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const userId = req.userId;
      const user = await this.userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "المستخدم غير موجود"
        });
      }

      res.status(200).json({
        success: true,
        data: { user: this.formatUserResponse(user), role: this.role },
        message: "تم جلب البيانات بنجاح",
      });
    } catch (error) {
      console.error(`Get ${this.role} profile error:`, error);
      res.status(500).json({ success: false, message: "خطأ في الخادم" });
    }
  }

  // Password reset request (placeholder - implement SMS/email logic)
  async requestPasswordReset(req, res) {
    try {
      const { phone } = req.body;

      const user = await this.userModel.findOne({ phone });
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.status(200).json({
          success: true,
          message: "إذا كان الرقم مسجل لدينا، سيتم إرسال رمز التحقق"
        });
      }

      // Generate reset token/code (implement SMS service)
      // For now, just return success
      res.status(200).json({
        success: true,
        message: "تم إرسال رمز التحقق إلى رقم هاتفك"
      });
    } catch (error) {
      console.error(`Password reset request error:`, error);
      res.status(500).json({ success: false, message: "خطأ في الخادم" });
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const { phone, resetCode, newPassword } = req.body;

      // Verify reset code (implement verification logic)
      const user = await this.userModel.findOne({ phone });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "رمز التحقق غير صحيح"
        });
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "تم تحديث كلمة المرور بنجاح"
      });
    } catch (error) {
      console.error(`Reset password error:`, error);
      res.status(500).json({ success: false, message: "خطأ في الخادم" });
    }
  }

  // Logout (client-side token removal, but can log the event)
  async logout(req, res) {
    try {
      // Log logout event
      await this.logLogin(req.userPhone, true, req.userId, req, "User logged out");
      res.status(200).json({
        success: true,
        message: "تم تسجيل الخروج بنجاح"
      });
    } catch (error) {
      console.error(`Logout error:`, error);
      res.status(500).json({ success: false, message: "خطأ في الخادم" });
    }
  }

  // Abstract methods to be implemented by subclasses
  formatUserResponse(user) {
    throw new Error("formatUserResponse must be implemented by subclass");
  }

  getRegistrationSuccessMessage() {
    throw new Error("getRegistrationSuccessMessage must be implemented by subclass");
  }
}

module.exports = BaseAuthController;