const jwt = require("jsonwebtoken");
const User = require("../models/User");
const StoreOwner = require("../models/StoreOwner");
const Driver = require("../models/Driver");

// Base auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "يجب تسجيل الدخول" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token غير صالح" });
  }
};

// Customer-only middleware
const isCustomer = async (req, res, next) => {
  await authMiddleware(req, res, async () => {
    if (req.userRole !== "customer") {
      return res
        .status(403)
        .json({ success: false, message: "غير مصرح لك بالوصول" });
    }

    const user = await User.findById(req.userId);
    if (!user || !user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "الحساب غير نشط" });
    }

    req.user = user;
    next();
  });
};

// Store Owner-only middleware
const isStoreOwner = async (req, res, next) => {
  await authMiddleware(req, res, async () => {
    if (req.userRole !== "store") {
      return res
        .status(403)
        .json({ success: false, message: "غير مصرح لك بالوصول" });
    }

    const owner = await StoreOwner.findById(req.userId).populate("storeId");
    if (!owner || !owner.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "الحساب غير نشط" });
    }

    req.owner = owner;
    req.storeId = owner.storeId;
    next();
  });
};

// Driver-only middleware
const isDriver = async (req, res, next) => {
  await authMiddleware(req, res, async () => {
    if (req.userRole !== "driver") {
      return res
        .status(403)
        .json({ success: false, message: "غير مصرح لك بالوصول" });
    }

    const driver = await Driver.findById(req.userId);
    if (!driver || !driver.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "الحساب غير نشط" });
    }

    req.driver = driver;
    next();
  });
};

module.exports = {
  authMiddleware,
  isCustomer,
  isStoreOwner,
  isDriver,
  // Admin middleware - for now, we'll use a simple check based on a special admin phone number
  isAdmin: async (req, res, next) => {
    await authMiddleware(req, res, async () => {
      // For now, we'll consider a user as admin if they have a specific admin phone number
      // This should be stored in environment variables for security
      const adminPhones = process.env.ADMIN_PHONES?.split(',') || ['01234567890']; // Default fallback
      
      // Get the user based on role to check their phone number
      let user;
      switch (req.userRole) {
        case 'customer':
          user = await User.findById(req.userId);
          break;
        case 'store':
          user = await StoreOwner.findById(req.userId);
          break;
        case 'driver':
          user = await Driver.findById(req.userId);
          break;
        default:
          user = null;
      }
      
      if (!user || !adminPhones.includes(user.phone)) {
        return res
          .status(403)
          .json({ success: false, message: "غير مصرح لك بالوصول" });
      }
      
      next();
    });
  }
};
