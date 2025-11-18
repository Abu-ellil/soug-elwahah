const BaseAuthController = require("../baseAuth.controller");
const User = require("../../models/User");

class CustomerAuthController extends BaseAuthController {
  constructor() {
    super(User, "customer");
  }

  formatUserResponse(user) {
    return {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  getRegistrationSuccessMessage() {
    return "تم إنشاء الحساب بنجاح";
  }
}

const customerAuthController = new CustomerAuthController();

const register = (req, res) => customerAuthController.register(req, res);
const login = (req, res) => customerAuthController.login(req, res);
const getProfile = (req, res) => customerAuthController.getProfile(req, res);
const requestPasswordReset = (req, res) => customerAuthController.requestPasswordReset(req, res);
const resetPassword = (req, res) => customerAuthController.resetPassword(req, res);
const logout = (req, res) => customerAuthController.logout(req, res);

module.exports = {
  register,
  login,
  getProfile,
  requestPasswordReset,
  resetPassword,
  logout,
};