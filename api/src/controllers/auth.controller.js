const User = require("../models/User");
const StoreOwner = require("../models/StoreOwner");
const Driver = require("../models/Driver");
const { generateToken } = require("../utils/jwt");
const bcrypt = require("bcryptjs");

const registerCustomer = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "رقم الهاتف مستخدم من قبل" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      name,
      phone,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id,
      role: "customer",
      phone: user.phone,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        token,
      },
      message: "تم إنشاء الحساب بنجاح",
    });
  } catch (error) {
    console.error("Register customer error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const registerStoreOwner = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // Check if store owner already exists
    const existingOwner = await StoreOwner.findOne({ phone });
    if (existingOwner) {
      return res
        .status(400)
        .json({ success: false, message: "رقم الهاتف مستخدم من قبل" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new store owner
    const owner = new StoreOwner({
      name,
      phone,
      password: hashedPassword,
    });

    await owner.save();

    // Generate token
    const token = generateToken({
      userId: owner._id,
      role: "store",
      phone: owner.phone,
    });

    res.status(201).json({
      success: true,
      data: {
        owner: {
          _id: owner._id,
          name: owner.name,
          phone: owner.phone,
          isActive: owner.isActive,
          createdAt: owner.createdAt,
        },
        token,
      },
      message: "تم إنشاء حساب التاجر بنجاح",
    });
  } catch (error) {
    console.error("Register store owner error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const registerDriver = async (req, res) => {
  try {
    const { name, phone, password, vehicleType, vehicleNumber } = req.body;

    // Check if driver already exists
    const existingDriver = await Driver.findOne({ phone });
    if (existingDriver) {
      return res
        .status(400)
        .json({ success: false, message: "رقم الهاتف مستخدم من قبل" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new driver
    const driver = new Driver({
      name,
      phone,
      password: hashedPassword,
      vehicleType,
      vehicleNumber,
    });

    await driver.save();

    res.status(201).json({
      success: true,
      data: {
        driver: {
          _id: driver._id,
          name: driver.name,
          phone: driver.phone,
          vehicleType: driver.vehicleType,
          vehicleNumber: driver.vehicleNumber,
          isActive: driver.isActive,
          createdAt: driver.createdAt,
        },
      },
      message: "سيتم مراجعة طلبك خلال 24 ساعة",
    });
  } catch (error) {
    console.error("Register driver error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const login = async (req, res) => {
  try {
    const { phone, password, role } = req.body;

    if (!phone || !password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "يرجى تعبئة جميع الحقول" });
    }

    let user;
    let userType;

    switch (role) {
      case "customer":
        user = await User.findOne({ phone });
        userType = "customer";
        break;
      case "store":
        user = await StoreOwner.findOne({ phone });
        userType = "store";
        break;
      case "driver":
        user = await Driver.findOne({ phone });
        userType = "driver";
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "نوع المستخدم غير صحيح" });
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "بيانات الدخول غير صحيحة" });
    }

    if (!user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "الحساب غير نشط" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "بيانات الدخول غير صحيحة" });
    }

    // Generate token
    const token = generateToken({
      userId: user._id,
      role: userType,
      phone: user.phone,
    });

    // Prepare user data to return
    let userData;
    if (role === "customer") {
      userData = {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
      };
    } else if (role === "store") {
      userData = {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        isActive: user.isActive,
        storeId: user.storeId,
      };
    } else if (role === "driver") {
      userData = {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        vehicleType: user.vehicleType,
        vehicleNumber: user.vehicleNumber,
        isAvailable: user.isAvailable,
        isActive: user.isActive,
      };
    }

    res.status(200).json({
      success: true,
      data: {
        user: userData,
        token,
        role: userType,
      },
      message: "تم تسجيل الدخول بنجاح",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    let user;
    switch (userRole) {
      case "customer":
        user = await User.findById(userId);
        break;
      case "store":
        user = await StoreOwner.findById(userId).populate("storeId");
        break;
      case "driver":
        user = await Driver.findById(userId);
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "نوع المستخدم غير صحيح" });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: { user, role: userRole },
      message: "تم جلب البيانات بنجاح",
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  registerCustomer,
  registerStoreOwner,
  registerDriver,
  login,
  getMe,
};
