const BaseAuthController = require("../baseAuth.controller");
const StoreOwner = require("../../models/StoreOwner");

class StoreAuthController extends BaseAuthController {
  constructor() {
    super(StoreOwner, "store");
  }

  formatUserResponse(user) {
    return {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      isActive: user.isActive,
      stores: user.stores,
      verificationStatus: user.verificationStatus,
      createdAt: user.createdAt,
    };
  }

  getRegistrationSuccessMessage() {
    return "تم إنشاء حساب التاجر بنجاح، يمكنك الآن التقدم بطلب إنشاء متجر";
  }

  // Override register to handle store owner specific fields
  async register(req, res) {
    const additionalFields = {
      stores: [], // Start with empty stores array
    };
    return super.register(req, res, additionalFields);
  }

  // Override login to handle verification status
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

      console.log('Login attempt for phone:', phone);
      const user = await this.userModel.findOne({ phone }).maxTimeMS(10000);
      console.log('User found:', user ? { _id: user._id, phone: user.phone, isActive: user.isActive, verificationStatus: user.verificationStatus } : 'not found');

      if (!user) {
        await this.logLogin(phone, false, null, req, "User not found");
        return res.status(401).json({
          success: false,
          error: "Phone number or password is incorrect"
        });
      }

      // Check verification status for store owners
      if (user.verificationStatus === "rejected") {
        await this.logLogin(phone, false, user._id, req, "Store owner account rejected");
        return res.status(401).json({
          success: false,
          error: "الحساب مرفوض",
          verificationStatus: "rejected"
        });
      }

      // Store owners can login even if isActive is false, as they might have pending stores
      console.log('Checking password for user:', user._id);
      const isPasswordValid = await this.validatePassword(password, user.password);
      console.log('Password valid:', isPasswordValid);
      if (!isPasswordValid) {
        await this.logLogin(phone, false, user._id, req, "Invalid password");
        return res.status(401).json({
          success: false,
          error: "Phone number or password is incorrect"
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

  // Override getProfile to populate stores
  async getProfile(req, res) {
    try {
      const userId = req.userId;
      const user = await this.userModel.findById(userId).populate("stores");

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
}

const storeAuthController = new StoreAuthController();

const register = (req, res) => storeAuthController.register(req, res);
const login = (req, res) => storeAuthController.login(req, res);
const getProfile = (req, res) => storeAuthController.getProfile(req, res);
const requestPasswordReset = (req, res) => storeAuthController.requestPasswordReset(req, res);
const resetPassword = (req, res) => storeAuthController.resetPassword(req, res);
const logout = (req, res) => storeAuthController.logout(req, res);

module.exports = {
  register,
  login,
  getProfile,
  requestPasswordReset,
  resetPassword,
  logout,
};