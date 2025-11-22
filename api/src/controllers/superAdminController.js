const SuperAdmin = require("../models/SuperAdmin");
const User = require("../models/User");
const StoreOwner = require("../models/StoreOwner");
const Driver = require("../models/Driver");
const Store = require("../models/Store");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register super admin
const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ success: false, message: "جميع الحقول مطلوبة" });
    }

    // Check if super admin already exists with this email or phone
    const existingAdmin = await SuperAdmin.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "المشرف موجود بالفعل" });
    }

    // Create new super admin
    const superAdmin = new SuperAdmin({
      name,
      email,
      phone,
      password,
      role: 'super_admin'
    });

    await superAdmin.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: superAdmin._id, role: superAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      data: {
        admin: {
          _id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
          phone: superAdmin.phone,
          role: superAdmin.role
        }
      },
      message: "تم إنشاء حساب المشرف بنجاح",
    });
  } catch (error) {
    console.error("Register super admin error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Login super admin
const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "البريد الإلكتروني وكلمة المرور مطلوبين" });
    }

    // Find super admin by email
    const superAdmin = await SuperAdmin.findOne({ email });

    if (!superAdmin || !superAdmin.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "بيانات تسجيل الدخول غير صحيحة" });
    }

    // Check password
    const isPasswordValid = await superAdmin.comparePassword(password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "بيانات تسجيل الدخول غير صحيحة" });
    }

    // Update last login
    superAdmin.lastLogin = new Date();
    await superAdmin.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: superAdmin._id, role: superAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      data: {
        admin: {
          _id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
          phone: superAdmin.phone,
          role: superAdmin.role
        }
      },
      message: "تم تسجيل الدخول بنجاح",
    });
  } catch (error) {
    console.error("Login super admin error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get all users (customers, store owners, drivers)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let users = [];
    let total = 0;

    // Query based on role
    switch (role) {
      case 'customer':
        const customerQuery = {};
        if (search) {
          customerQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ];
        }
        users = await User.find(customerQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
        total = await User.countDocuments(customerQuery);
        break;

      case 'store':
        const storeOwnerQuery = {};
        if (search) {
          storeOwnerQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ];
        }
        users = await StoreOwner.find(storeOwnerQuery)
          .populate('storeId', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
        total = await StoreOwner.countDocuments(storeOwnerQuery);
        break;

      case 'driver':
        const driverQuery = {};
        if (search) {
          driverQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ];
        }
        users = await Driver.find(driverQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
        total = await Driver.countDocuments(driverQuery);
        break;

      default:
        // Get all users from all collections
        const allCustomers = await User.find({})
          .select('_id name email phone role isActive createdAt')
          .sort({ createdAt: -1 });
        const allStoreOwners = await StoreOwner.find({})
          .populate('storeId', 'name')
          .select('_id name email phone role isActive createdAt')
          .sort({ createdAt: -1 });
        const allDrivers = await Driver.find({})
          .select('_id name email phone role isActive createdAt')
          .sort({ createdAt: -1 });

        // Combine and sort all users
        users = [
          ...allCustomers.map(u => ({ ...u.toObject(), role: 'customer' })),
          ...allStoreOwners.map(u => ({ ...u.toObject(), role: 'store' })),
          ...allDrivers.map(u => ({ ...u.toObject(), role: 'driver' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Apply pagination
        total = users.length;
        users = users.slice(skip, skip + parseInt(limit));
    }

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: "تم جلب المستخدمين بنجاح",
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get all stores
const getAllStores = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const stores = await Store.find(query)
      .populate('categoryId', 'name nameEn icon color')
      .populate('ownerId', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Store.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        stores,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: "تم جلب المتاجر بنجاح",
    });
 } catch (error) {
    console.error("Get all stores error:", error);
    res.status(50).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { storeName: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name phone')
      .populate('storeId', 'name phone')
      .populate('driverId', 'name phone')
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: "تم جلب الطلبات بنجاح",
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Update user status (activate/deactivate)
const updateUserStatus = async (req, res) => {
  try {
    const { userId, role } = req.params;
    const { isActive } = req.body;

    let user;
    let modelName;

    // Determine which model to update based on role
    switch (role) {
      case 'customer':
        user = await User.findById(userId);
        modelName = 'User';
        break;
      case 'store':
        user = await StoreOwner.findById(userId);
        modelName = 'StoreOwner';
        break;
      case 'driver':
        user = await Driver.findById(userId);
        modelName = 'Driver';
        break;
      default:
        return res
          .status(40)
          .json({ success: false, message: "دور غير صحيح" });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    }

    // Update user status
    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: { [modelName.toLowerCase()]: user },
      message: isActive ? "تم تفعيل المستخدم بنجاح" : "تم إلغاء تفعيل المستخدم بنجاح",
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Update store status (activate/deactivate)
const updateStoreStatus = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { isActive } = req.body;

    const store = await Store.findById(storeId);

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    // Update store status
    store.isActive = isActive;
    await store.save();

    res.status(200).json({
      success: true,
      data: { store },
      message: isActive ? "تم تفعيل المحل بنجاح" : "تم إلغاء تفعيل المحل بنجاح",
    });
  } catch (error) {
    console.error("Update store status error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments();
    const totalStores = await Store.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const totalOrders = await Order.countDocuments();
    const activeStores = await Store.countDocuments({ isActive: true });
    const activeDrivers = await Driver.countDocuments({ isActive: true });
    const activeCustomers = await User.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalStores,
        totalDrivers,
        totalOrders,
        activeCustomers,
        activeStores,
        activeDrivers
      },
      message: "تم جلب إحصائيات النظام بنجاح",
    });
 } catch (error) {
    console.error("Get system stats error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get super admin profile
const getSuperAdminProfile = async (req, res) => {
  try {
    // req.superAdmin should be available from the isSuperAdmin middleware
    if (!req.superAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin profile not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        admin: {
          _id: req.superAdmin._id,
          name: req.superAdmin.name,
          email: req.superAdmin.email,
          phone: req.superAdmin.phone,
          role: req.superAdmin.role,
          permissions: req.superAdmin.permissions,
          lastLogin: req.superAdmin.lastLogin,
          isActive: req.superAdmin.isActive,
        }
      },
      message: "Admin profile retrieved successfully",
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  registerSuperAdmin,
  loginSuperAdmin,
  getAllUsers,
  getAllStores,
  getAllOrders,
  updateUserStatus,
  updateStoreStatus,
  getSystemStats,
  getSuperAdminProfile,
};