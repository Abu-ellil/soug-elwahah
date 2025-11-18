const BaseAuthController = require("../baseAuth.controller");
const Driver = require("../../models/Driver");

class DriverAuthController extends BaseAuthController {
  constructor() {
    super(Driver, "driver");
  }

  formatUserResponse(user) {
    return {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      vehicleType: user.vehicleType,
      vehicleNumber: user.vehicleNumber,
      isAvailable: user.isAvailable,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  getRegistrationSuccessMessage() {
    return "سيتم مراجعة طلبك خلال 24 ساعة";
  }

  // Override register to handle additional driver fields
  async register(req, res) {
    const { vehicleType, vehicleNumber } = req.body;
    const additionalFields = {
      vehicleType: vehicleType || "unknown",
      vehicleNumber: vehicleNumber || "N/A",
    };
    return super.register(req, res, additionalFields);
  }
}

const driverAuthController = new DriverAuthController();

const register = (req, res) => driverAuthController.register(req, res);
const login = (req, res) => driverAuthController.login(req, res);
const getProfile = (req, res) => driverAuthController.getProfile(req, res);
const requestPasswordReset = (req, res) => driverAuthController.requestPasswordReset(req, res);
const resetPassword = (req, res) => driverAuthController.resetPassword(req, res);
const logout = (req, res) => driverAuthController.logout(req, res);

module.exports = {
  register,
  login,
  getProfile,
  requestPasswordReset,
  resetPassword,
  logout,
};