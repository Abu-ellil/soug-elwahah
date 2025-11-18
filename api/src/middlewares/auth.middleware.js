const jwt = require("jsonwebtoken");
const User = require("../models/User");
const StoreOwner = require("../models/StoreOwner");
const Driver = require("../models/Driver");
const SuperAdmin = require("../models/SuperAdmin");

// Base auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7, authHeader.length)
        : null;

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

// Store Owner with approved store middleware - for store operations that require an approved store
const isStoreOwnerWithApprovedStore = async (req, res, next) => {
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

    // Check that the store owner has been approved before allowing access to store operations
    if (owner.verificationStatus !== "approved") {
      return res
        .status(403)
        .json({
          success: false,
          message: "الحساب في انتظار الموافقة",
          verificationStatus: owner.verificationStatus
        });
    }

    // Also check if the associated store is approved
    if (owner.storeId && owner.storeId.verificationStatus !== "approved") {
      return res
        .status(403)
        .json({
          success: false,
          message: "المتجر في انتظار الموافقة",
          verificationStatus: owner.storeId.verificationStatus
        });
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
 isStoreOwnerWithApprovedStore,
  isDriver,
  // Admin middleware - for now, we'll use a simple check based on a special admin phone number
  isAdmin: async (req, res, next) => {
    await authMiddleware(req, res, async () => {
      // Check if user is a super admin first
      const superAdmin = await SuperAdmin.findById(req.userId);
      if (superAdmin && superAdmin.isActive) {
        req.isAdmin = true;
        req.adminType = "super_admin";
        next();
        return;
      }

      // For regular admins, check if their phone number is in the admin list
      // Get the user based on role to check their phone number
      let user;
      switch (req.userRole) {
        case "customer":
          user = await User.findById(req.userId);
          break;
        case "store":
          user = await StoreOwner.findById(req.userId);
          break;
        case "driver":
          user = await Driver.findById(req.userId);
          break;
        default:
          user = null;
      }

      // For now, we'll consider a user as admin if they have a specific admin phone number
      // This should be stored in environment variables for security
      const adminPhones = process.env.ADMIN_PHONES?.split(",") || [
        "01234567890",
      ]; // Default fallback

      if (!user || !adminPhones.includes(user.phone)) {
        return res
          .status(403)
          .json({ success: false, message: "غير مصرح لك بالوصول" });
      }

      req.isAdmin = true;
      req.adminType = "regular_admin";
      next();
    });
  },

  // Super Admin middleware - only for super admin users
  isSuperAdmin: async (req, res, next) => {
    await authMiddleware(req, res, async () => {
      const superAdmin = await SuperAdmin.findById(req.userId);

      if (
        !superAdmin ||
        !superAdmin.isActive ||
        superAdmin.role !== "super_admin"
      ) {
        return res
          .status(403)
          .json({ success: false, message: "غير مصرح لك بالوصول كمشرف خاص" });
      }

      req.isSuperAdmin = true;
      req.superAdmin = superAdmin;
      next();
    });
  },

  // General admin authentication that checks both super admin and regular admin
  isAdminOrSuperAdmin: async (req, res, next) => {
    await authMiddleware(req, res, async () => {
      // First check if it's a super admin
      const superAdmin = await SuperAdmin.findById(req.userId);
      if (superAdmin && superAdmin.isActive) {
        req.isAdmin = true;
        req.isSuperAdmin = true;
        req.adminType = "super_admin";
        req.superAdmin = superAdmin;
        next();
        return;
      }

      // Then check if it's a regular admin (phone-based)
      const adminPhones = process.env.ADMIN_PHONES?.split(",") || [
        "01234567890",
      ]; // Default fallback

      // Get the user based on role to check their phone number
      let user;
      switch (req.userRole) {
        case "customer":
          user = await User.findById(req.userId);
          break;
        case "store":
          user = await StoreOwner.findById(req.userId);
          break;
        case "driver":
          user = await Driver.findById(req.userId);
          break;
        default:
          user = null;
      }

      // IMPORTANT: Store owners who are not approved should NOT be able to access admin functions
      if (req.userRole === "store") {
        const storeOwner = await StoreOwner.findById(req.userId);
        if (!storeOwner || storeOwner.verificationStatus !== "approved") {
          return res
            .status(403)
            .json({ success: false, message: "غير مصرح لك بالوصول - المتجر غير معتمد" });
        }
      }

      if (!user || !adminPhones.includes(user.phone)) {
        return res
          .status(403)
          .json({ success: false, message: "غير مصرح لك بالوصول" });
      }

      req.isAdmin = true;
      req.adminType = "regular_admin";
      next();
    });
 },
};
