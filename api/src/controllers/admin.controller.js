const Store = require("../models/Store");
const StoreOwner = require("../models/StoreOwner");
const User = require("../models/User");
const Driver = require("../models/Driver");
const SuperAdmin = require("../models/SuperAdmin");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { logLoginAttempt } = require("../services/loginLog.service");
const admin = require("../config/firebase");

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
      return res.status(400).json({
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
      return res.status(400).json({
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
      return res.status(400).json({
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

// Get analytics dashboard data
const getAnalyticsDashboard = async (req, res) => {
  try {
    // Check if user is authorized as admin
    if (!req.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "غير مصرح لك بالوصول" });
    }

    // Get date range from query parameters
    const { dateFrom, dateTo } = req.query;

    // Set up date filters if provided
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) {
        dateFilter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        dateFilter.createdAt.$lte = new Date(dateTo);
      }
    }

    // Count total orders
    const totalOrders = await Order.countDocuments(dateFilter);

    // Calculate total revenue
    const orders = await Order.find(dateFilter);
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );

    // Count total users
    const totalUsers = await User.countDocuments(dateFilter);

    // Count total stores
    const totalStores = await Store.countDocuments(dateFilter);

    // Count total drivers
    const totalDrivers = await Driver.countDocuments(dateFilter);

    // Get revenue by date (for chart)
    const revenueByDate = [];
    if (orders.length > 0) {
      // Group orders by date and sum revenue
      const groupedOrders = orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += order.total || 0;
        return acc;
      }, {});

      for (const [date, revenue] of Object.entries(groupedOrders)) {
        revenueByDate.push({ date, revenue });
      }
      // Sort by date
      revenueByDate.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      ...(dateFilter.createdAt
        ? [
            {
              $match: dateFilter,
            },
          ]
        : []),
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);

    // Get top 5 stores by order count
    const topStores = await Order.aggregate([
      ...(dateFilter.createdAt
        ? [
            {
              $match: dateFilter,
            },
          ]
        : []),
      {
        $group: {
          _id: "$storeId",
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "stores",
          localField: "_id",
          foreignField: "_id",
          as: "store",
        },
      },
      {
        $unwind: "$store",
      },
      {
        $project: {
          storeId: "$_id",
          storeName: "$store.name",
          orders: "$orderCount",
        },
      },
      {
        $sort: { orders: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        totalUsers,
        totalStores,
        totalDrivers,
        revenueByDate,
        ordersByStatus,
        topStores,
      },
      message: "تم جلب بيانات الإحصائيات بنجاح",
    });
  } catch (error) {
    console.error("Get analytics dashboard error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get all orders - similar to super admin implementation but for regular admins
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      dateFrom,
      dateTo,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { storeName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
        { storePhone: { $regex: search, $options: "i" } },
      ];
    }

    // Add date range filter if provided
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    const orders = await Order.find(query)
      .populate("customerId", "name phone")
      .populate("storeId", "name phone")
      .populate("driverId", "name phone")
      .populate("items.productId", "name price")
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
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      message: "تم جلب الطلبات بنجاح",
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("customerId", "name phone email")
      .populate("storeId", "name phone")
      .populate("driverId", "name phone")
      .populate("items.productId", "name price");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: { order },
      message: "تم جلب الطلب بنجاح",
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, driverId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }

    // Update order fields
    if (status) order.status = status;
    if (driverId) order.driverId = driverId;

    await order.save();

    // Populate the updated order for response
    const updatedOrder = await Order.findById(orderId)
      .populate("customerId", "name phone email")
      .populate("storeId", "name phone")
      .populate("driverId", "name phone")
      .populate("items.productId", "name price");

    res.status(200).json({
      success: true,
      data: { order: updatedOrder },
      message: "تم تحديث الطلب بنجاح",
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "الطلب غير موجود" });
    }

    // Update status to cancelled
    order.status = "cancelled";
    if (reason) order.cancelReason = reason;
    order.cancelledAt = new Date();

    await order.save();

    // Populate the updated order for response
    const updatedOrder = await Order.findById(orderId)
      .populate("customerId", "name phone email")
      .populate("storeId", "name phone")
      .populate("driverId", "name phone")
      .populate("items.productId", "name price");

    res.status(200).json({
      success: true,
      data: { order: updatedOrder },
      message: "تم إلغاء الطلب بنجاح",
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get stores with pending verification status
const getPendingStores = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { verificationStatus: "pending" };

    const stores = await Store.find(query)
      .populate("categoryId", "name nameEn icon color")
      .populate("ownerId", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Transform the stores data to match the expected frontend format
    const transformedStores = stores.map(store => {
      const storeObj = store.toObject();
      // Flatten the populated owner data into ownerName and ownerPhone fields
      if (storeObj.ownerId) {
        storeObj.ownerName = storeObj.ownerId.name;
        storeObj.ownerPhone = storeObj.ownerId.phone;
        // Remove the original ownerId object to avoid conflicts
        delete storeObj.ownerId;
      }
      return storeObj;
    });

    const total = await Store.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        stores: transformedStores,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      message: "تم جلب المتاجر المعلقة بنجاح",
    });
  } catch (error) {
    console.error("Get pending stores error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get all stores with pagination and search
const getAllStores = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      verificationStatus,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { nameEn: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.status = status;
    }
    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }

    const stores = await Store.find(query)
      .populate("categoryId", "name nameEn icon color")
      .populate("ownerId", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Transform the stores data to match the expected frontend format
    const transformedStores = stores.map(store => {
      const storeObj = store.toObject();
      // Flatten the populated owner data into ownerName and ownerPhone fields
      if (storeObj.ownerId) {
        storeObj.ownerName = storeObj.ownerId.name;
        storeObj.ownerPhone = storeObj.ownerId.phone;
        // Remove the original ownerId object to avoid conflicts
        delete storeObj.ownerId;
      }
      return storeObj;
    });

    const total = await Store.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        stores: transformedStores,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      message: "تم جلب المتاجر بنجاح",
    });
  } catch (error) {
    console.error("Get all stores error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get store by ID
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findById(id)
      .populate("categoryId", "name nameEn icon color")
      .populate("ownerId", "name phone");

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    // Transform the store data to match the expected frontend format
    const storeObj = store.toObject();
    // Flatten the populated owner data into ownerName and ownerPhone fields
    if (storeObj.ownerId) {
      storeObj.ownerName = storeObj.ownerId.name;
      storeObj.ownerPhone = storeObj.ownerId.phone;
      // Remove the original ownerId object to avoid conflicts
      delete storeObj.ownerId;
    }

    res.status(200).json({
      success: true,
      data: { store: storeObj },
      message: "تم جلب المحل بنجاح",
    });
  } catch (error) {
    console.error("Get store by ID error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Update store
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verificationStatus } = req.body;

    const store = await Store.findById(id);
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    // Update store fields
    if (status) store.status = status;
    if (verificationStatus) store.verificationStatus = verificationStatus;

    await store.save();

    // Populate and return updated store
    const updatedStore = await Store.findById(id)
      .populate("categoryId", "name nameEn icon color")
      .populate("ownerId", "name phone");

    // Transform the store data to match the expected frontend format
    const storeObj = updatedStore.toObject();
    // Flatten the populated owner data into ownerName and ownerPhone fields
    if (storeObj.ownerId) {
      storeObj.ownerName = storeObj.ownerId.name;
      storeObj.ownerPhone = storeObj.ownerId.phone;
      // Remove the original ownerId object to avoid conflicts
      delete storeObj.ownerId;
    }

    res.status(200).json({
      success: true,
      data: { store: storeObj },
      message: "تم تحديث المحل بنجاح",
    });
  } catch (error) {
    console.error("Update store error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Approve store
const approveStore = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findById(id);
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    store.verificationStatus = "approved";
    store.isActive = true; // Activate the store
    store.isOpen = true; // Allow the store to be open
    await store.save();

    // Also activate the store owner if not already approved
    await StoreOwner.findByIdAndUpdate(store.ownerId, {
      verificationStatus: "approved",
      isActive: true // Activate the owner
    });

    // Create notification for the store owner
    const notification = new Notification({
      userId: store.ownerId,
      title: "تم قبول متجرك",
      message: `تم قبول متجر "${store.name}" وتفعيله بنجاح. يمكنك الآن بدء العمل في النظام.`,
      type: "success",
      data: {
        storeId: store._id,
        action: "store_approved"
      }
    });
    await notification.save();

    // Send push notification to store owner if they have an FCM token
    const storeOwner = await StoreOwner.findById(store.ownerId);
    if (storeOwner && storeOwner.fcmToken) {
      try {
        const message = {
          notification: {
            title: "تم قبول متجرك",
            body: `تم قبول متجر "${store.name}" وتفعيله بنجاح. يمكنك الآن تسجيل الدخول وإضافة منتجات.`,
          },
          data: {
            type: "store_approved",
            storeId: store._id.toString(),
            action: "store_approved"
          },
          token: storeOwner.fcmToken,
        };

        await admin.messaging().send(message);
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
    }

    // Populate and return updated store
    const updatedStore = await Store.findById(id)
      .populate("categoryId", "name nameEn icon color")
      .populate("ownerId", "name phone");

    // Transform the store data to match the expected frontend format
    const storeObj = updatedStore.toObject();
    // Flatten the populated owner data into ownerName and ownerPhone fields
    if (storeObj.ownerId) {
      storeObj.ownerName = storeObj.ownerId.name;
      storeObj.ownerPhone = storeObj.ownerId.phone;
      // Remove the original ownerId object to avoid conflicts
      delete storeObj.ownerId;
    }

    res.status(200).json({
      success: true,
      data: { store: storeObj },
      message: "تم قبول المحل بنجاح",
    });
  } catch (error) {
    console.error("Approve store error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Reject store
const rejectStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const store = await Store.findById(id);
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    store.verificationStatus = "rejected";
    store.isActive = false; // Deactivate the store
    if (reason) store.rejectionReason = reason;
    await store.save();

    // Note: Don't deactivate the store owner, as they might have other stores
    // Only deactivate if all their stores are rejected

    // Create notification for the store owner
    const notification = new Notification({
      userId: store.ownerId,
      title: "تم رفض متجرك",
      message: reason ? `تم رفض متجر "${store.name}" لسبب: ${reason}` : `تم رفض متجر "${store.name}"`,
      type: "error",
      data: {
        storeId: store._id,
        action: "store_rejected"
      }
    });
    await notification.save();

    // Send push notification to store owner if they have an FCM token
    const storeOwner = await StoreOwner.findById(store.ownerId);
    if (storeOwner && storeOwner.fcmToken) {
      try {
        const message = {
          notification: {
            title: "تم رفض متجرك",
            body: reason ? `تم رفض متجر "${store.name}" لسبب: ${reason}` : `تم رفض متجر "${store.name}"`,
          },
          data: {
            type: "store_rejected",
            storeId: store._id.toString(),
            action: "store_rejected"
          },
          token: storeOwner.fcmToken,
        };

        await admin.messaging().send(message);
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
    }

    // Populate and return updated store
    const updatedStore = await Store.findById(id)
      .populate("categoryId", "name nameEn icon color")
      .populate("ownerId", "name phone");

    // Transform the store data to match the expected frontend format
    const storeObj = updatedStore.toObject();
    // Flatten the populated owner data into ownerName and ownerPhone fields
    if (storeObj.ownerId) {
      storeObj.ownerName = storeObj.ownerId.name;
      storeObj.ownerPhone = storeObj.ownerId.phone;
      // Remove the original ownerId object to avoid conflicts
      delete storeObj.ownerId;
    }

    res.status(200).json({
      success: true,
      data: { store: storeObj },
      message: "تم رفض المحل بنجاح",
    });
  } catch (error) {
    console.error("Reject store error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Delete store
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findById(id);
    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    await Store.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: { store },
      message: "تم حذف المحل بنجاح",
    });
  } catch (error) {
    console.error("Delete store error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get all drivers with pagination and search
const getAllDrivers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      verificationStatus,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.status = status;
    }
    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }

    const drivers = await Driver.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Driver.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        drivers,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      message: "تم جلب السائقين بنجاح",
    });
  } catch (error) {
    console.error("Get all drivers error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get drivers with pending verification status
const getPendingDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { verificationStatus: "pending" };

    const drivers = await Driver.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Driver.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        drivers,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      message: "تم جلب السائقين المعلقين بنجاح",
    });
  } catch (error) {
    console.error("Get pending drivers error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get driver by ID
const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findById(id);

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: { driver },
      message: "تم جلب السائق بنجاح",
    });
  } catch (error) {
    console.error("Get driver by ID error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Update driver
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verificationStatus } = req.body;

    const driver = await Driver.findById(id);
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    // Update driver fields
    if (status) driver.status = status;
    if (verificationStatus) driver.verificationStatus = verificationStatus;

    await driver.save();

    res.status(200).json({
      success: true,
      data: { driver },
      message: "تم تحديث السائق بنجاح",
    });
  } catch (error) {
    console.error("Update driver error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Approve driver
const approveDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findById(id);
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    driver.verificationStatus = "approved";
    await driver.save();

    res.status(200).json({
      success: true,
      data: { driver },
      message: "تم قبول السائق بنجاح",
    });
  } catch (error) {
    console.error("Approve driver error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Reject driver
const rejectDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const driver = await Driver.findById(id);
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    driver.verificationStatus = "rejected";
    if (reason) driver.rejectionReason = reason;
    await driver.save();

    res.status(200).json({
      success: true,
      data: { driver },
      message: "تم رفض السائق بنجاح",
    });
  } catch (error) {
    console.error("Reject driver error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findById(id);
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    await Driver.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: { driver },
      message: "تم حذف السائق بنجاح",
    });
  } catch (error) {
    console.error("Delete driver error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get all products with pagination and search
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      storeId,
      categoryId,
      availability,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { nameEn: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { descriptionEn: { $regex: search, $options: "i" } },
      ];
    }
    if (storeId) {
      query.storeId = storeId;
    }
    if (categoryId) {
      query.categoryId = categoryId;
    }
    if (availability) {
      query.isAvailable = availability === "available" ? true : false;
    }

    const products = await Product.find(query)
      .populate("storeId", "name phone")
      .populate("categoryId", "name nameEn")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      message: "تم جلب المنتجات بنجاح",
    });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("storeId", "name phone")
      .populate("categoryId", "name nameEn");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "المنتج غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: { product },
      message: "تم جلب المنتج بنجاح",
    });
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "المنتج غير موجود" });
    }

    // Update product fields
    if (availability)
      product.isAvailable = availability === "available" ? true : false;

    await product.save();

    // Populate and return updated product
    const updatedProduct = await Product.findById(id)
      .populate("storeId", "name phone")
      .populate("categoryId", "name nameEn");

    res.status(200).json({
      success: true,
      data: { product: updatedProduct },
      message: "تم تحديث المنتج بنجاح",
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get all users with pagination and search
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.isActive = status === "active" ? true : false;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      message: "تم جلب المستخدمين بنجاح",
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get all store owners with pagination and search
const getAllStoreOwners = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      verificationStatus,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.isActive = status === "active" ? true : false;
    }
    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }

    const storeOwners = await StoreOwner.find(query)
      .populate("storeId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StoreOwner.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        storeOwners,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
      message: "تم جلب مالكي المتاجر بنجاح",
    });
  } catch (error) {
    console.error("Get all store owners error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: { user },
      message: "تم جلب المستخدم بنجاح",
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    }

    // Update user fields
    if (status) user.isActive = status === "active" ? true : false;

    await user.save();

    res.status(200).json({
      success: true,
      data: { user },
      message: "تم تحديث المستخدم بنجاح",
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: { user },
      message: "تم حذف المستخدم بنجاح",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "المنتج غير موجود" });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: { product },
      message: "تم حذف المنتج بنجاح",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getStoresWithPendingCoordinates,
  approveStoreCoordinates,
  rejectStoreCoordinates,
  getAdminProfile,
  loginAdmin,
  getAnalyticsDashboard,
  getAllOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
  getPendingStores,
  getAllStores,
  getStoreById,
  updateStore,
  approveStore,
  rejectStore,
  deleteStore,
  getPendingDrivers,
  getAllDrivers,
  getDriverById,
  updateDriver,
  approveDriver,
  rejectDriver,
  deleteDriver,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllStoreOwners, // Add the missing function
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
