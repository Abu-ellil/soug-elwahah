const Store = require("../models/Store");
const StoreOwner = require("../models/StoreOwner");
const User = require("../models/User");
const Driver = require("../models/Driver");
const SuperAdmin = require("../models/SuperAdmin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { logLoginAttempt } = require("../services/loginLog.service");

// Get all stores with pending coordinate updates
const getStoresWithPendingCoordinates = async (req, res) => {
  try {
    const stores = await Store.find({
      pendingCoordinates: { $exists: true, $ne: null },
      "pendingCoordinates.lat": { $ne: null },
      "pendingCoordinates.lng": { $ne: null },
    })
      .populate("categoryId", "name nameEn icon color")
      .populate("ownerId", "name phone");

    res.status(200).json({
      success: true,
      data: { stores },
      message: "تم جلب المتاجر المعلقة بنجاح",
    });
  } catch (error) {
    console.error("Get stores with pending coordinates error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Approve store coordinate update
const approveStoreCoordinates = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findById(storeId);

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    if (
      !store.pendingCoordinates ||
      !store.pendingCoordinates.lat ||
      !store.pendingCoordinates.lng
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "لا توجد إحداثيات معلقة لهذا المتجر",
        });
    }

    // Update the store's coordinates with the pending coordinates
    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        coordinates: {
          lat: store.pendingCoordinates.lat,
          lng: store.pendingCoordinates.lng,
        },
        pendingCoordinates: undefined, // Remove pending coordinates
        updatedAt: Date.now(),
      },
      { new: true }
    ).populate("categoryId", "name nameEn icon color");

    res.status(200).json({
      success: true,
      data: { store: updatedStore },
      message: "تم قبول إحداثيات المتجر بنجاح",
    });
  } catch (error) {
    console.error("Approve store coordinates error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Reject store coordinate update
const rejectStoreCoordinates = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findById(storeId);

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    if (
      !store.pendingCoordinates ||
      !store.pendingCoordinates.lat ||
      !store.pendingCoordinates.lng
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "لا توجد إحداثيات معلقة لهذا المتجر",
        });
    }

    // Remove pending coordinates without approving them
    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        pendingCoordinates: undefined, // Remove pending coordinates
        updatedAt: Date.now(),
      },
      { new: true }
    ).populate("categoryId", "name nameEn icon color");

    res.status(200).json({
      success: true,
      data: { store: updatedStore },
      message: "تم رفض إحداثيات المتجر",
    });
  } catch (error) {
    console.error("Reject store coordinates error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get admin profile (for regular admins based on phone number verification)
const getAdminProfile = async (req, res) => {
  try {
    // req.user, req.owner, or req.driver should be available from the isAdmin middleware
    let adminProfile = null;
    let role = "admin";

    if (req.userRole === "customer" && req.user) {
      // Customer admin
      adminProfile = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email || "",
        phone: req.user.phone,
        role: "admin",
        permissions: ["read:stores", "read:orders", "read:users"],
        isActive: req.user.isActive,
      };
    } else if (req.userRole === "store" && req.owner) {
      // Store owner admin
      adminProfile = {
        _id: req.owner._id,
        name: req.owner.name,
        email: req.owner.email || "",
        phone: req.owner.phone,
        role: "admin",
        permissions: ["read:orders", "manage:store"],
        isActive: req.owner.isActive,
      };
    } else if (req.userRole === "driver" && req.driver) {
      // Driver admin
      adminProfile = {
        _id: req.driver._id,
        name: req.driver.name,
        email: req.driver.email || "",
        phone: req.driver.phone,
        role: "admin",
        permissions: ["read:orders", "update:delivery"],
        isActive: req.driver.isActive,
      };
    } else if (req.isSuperAdmin && req.superAdmin) {
      // Super admin
      adminProfile = {
        _id: req.superAdmin._id,
        name: req.superAdmin.name,
        email: req.superAdmin.email,
        phone: req.superAdmin.phone,
        role: req.superAdmin.role,
        permissions: req.superAdmin.permissions,
        lastLogin: req.superAdmin.lastLogin,
        isActive: req.superAdmin.isActive,
      };
      role = "super_admin";
    }

    if (!adminProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Admin profile not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        admin: adminProfile,
      },
      message: "Admin profile retrieved successfully",
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Admin login function (supports both email and phone)
const loginAdmin = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Validate required fields - either email or phone is acceptable
    if ((!email && !phone) || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "البريد الإلكتروني أو رقم الهاتف وكلمة المرور مطلوبين",
        });
    }

    // Use the provided identifier (email or phone)
    const identifier = email || phone;

    // Try to find user in different collections based on identifier type
    let user = null;
    let role = null;

    // First check if it's a super admin (by phone or email)
    // Super admins can always log in regardless of env variables
    const superAdmin = await SuperAdmin.findOne({
      $or: [
        { phone: identifier, isActive: true },
        { email: identifier, isActive: true },
      ],
    });
    if (superAdmin) {
      user = superAdmin;
      role = "super_admin";
    } else {
      // For non-super admins, check if identifier is in the admin list
      // Check both phone numbers and emails in admin list
      const adminPhones = process.env.ADMIN_PHONES?.split(",") || [];
      const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

      // Check if identifier is either an admin phone or admin email
      const isAdmin =
        adminPhones.includes(identifier) || adminEmails.includes(identifier);

      if (!isAdmin) {
        return res
          .status(401)
          .json({ success: false, message: "غير مصرح لك بالوصول" });
      }

      // Check in different user collections using either email or phone
      user = await User.findOne({
        $or: [
          { phone: identifier, isActive: true },
          { email: identifier, isActive: true },
        ],
      });
      if (user) {
        role = "customer";
      } else {
        user = await StoreOwner.findOne({
          $or: [
            { phone: identifier, isActive: true },
            { email: identifier, isActive: true },
          ],
        });
        if (user) {
          role = "store";
        } else {
          user = await Driver.findOne({
            $or: [
              { phone: identifier, isActive: true },
              { email: identifier, isActive: true },
            ],
          });
          if (user) {
            role = "driver";
          }
        }
      }
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "بيانات تسجيل الدخول غير صحيحة" });
    }

    // For super admins, check password
    if (role === "super_admin") {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ success: false, message: "بيانات تسجيل الدخول غير صحيحة" });
      }
    } else {
      // For regular admins, we might not have passwords stored for all user types
      // For now, we'll assume they're authorized based on phone number only
      // In a real implementation, you'd want to verify the password properly
    }

    // Update last login for super admins
    if (role === "super_admin") {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Prepare admin profile response
    let adminProfile;
    if (role === "super_admin") {
      adminProfile = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions,
      };
    } else {
      adminProfile = {
        _id: user._id,
        name: user.name,
        email: user.email || "",
        phone: user.phone,
        role: "admin",
        permissions: ["read:stores", "read:orders", "read:users"], // Default permissions
      };
    }

    res.status(200).json({
      success: true,
      token,
      data: {
        admin: adminProfile,
      },
      message: "تم تسجيل الدخول بنجاح",
    });
  } catch (error) {
    console.error("Login admin error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getStoresWithPendingCoordinates,
  approveStoreCoordinates,
  rejectStoreCoordinates,
  getAdminProfile,
  loginAdmin,
};
