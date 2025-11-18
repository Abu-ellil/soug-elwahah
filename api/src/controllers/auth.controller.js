const User = require("../models/User");
const StoreOwner = require("../models/StoreOwner");
const Driver = require("../models/Driver");
const Store = require("../models/Store");
const Category = require("../models/Category");
const { generateToken } = require("../utils/jwt");
const bcrypt = require("bcryptjs");
const { logLoginAttempt } = require("../services/loginLog.service");
const admin = require("../config/firebase");

const registerCustomer = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // Check if user already exists with timeout
    const existingUser = await User.findOne({ phone }).maxTimeMS(10000);
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
    let {
      name,
      email,
      phone,
      password,
      storeName,
      storeDescription,
      storeImage,
    } = req.body;
    
    // Parse coordinates if they are sent as a JSON string in form data
    let coordinates = req.body.coordinates;
    if (coordinates && typeof coordinates === 'string') {
      try {
        coordinates = JSON.parse(coordinates);
      } catch (e) {
        console.warn('Failed to parse coordinates from form data:', coordinates);
        coordinates = null;
      }
    }

    // Check if store owner already exists with timeout
    const existingOwner = await StoreOwner.findOne({ phone }).maxTimeMS(10000);
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

    // Get a default category (using the first one available) with timeout
    let defaultCategory = await Category.findOne().maxTimeMS(1000);
    if (!defaultCategory) {
      // If no category exists, we might need to handle this case differently
      // For now, let's create a default category ID (this might need adjustment)
      return res.status(400).json({
        success: false,
        message: "لا توجد فئات متاحة، يرجى الاتصال بالمسؤول",
      });
    }

    // Handle store image - if file was uploaded, process it; otherwise use the URL provided
    let storeImageUrl = "";
    if (req.file) {
      if (req.file.buffer) {
        // File is in memory (serverless environment), upload to Firebase Storage
        try {
          // Check if Firebase is properly configured
          if (admin && admin.storage) {
            const bucket = admin.storage().bucket(); // Get the default bucket
            const fileName = `store-images/storeImage-${Date.now()}-${Math.round(
              Math.random() * 1e9
            )}-${req.file.originalname}`;
            const file = bucket.file(fileName);

            const stream = file.createWriteStream({
              metadata: {
                contentType: req.file.mimetype,
              },
            });

            await new Promise((resolve, reject) => {
              stream.on("error", reject);
              stream.on("finish", resolve);
              stream.end(req.file.buffer);
            });

            // Make the file publicly readable
            await file.makePublic();

            // Get the public URL
            storeImageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          } else {
            // Firebase not configured, log warning and continue without image
            console.warn("Firebase not configured for image upload");
            // Instead of returning an error, allow registration to continue without image
            storeImageUrl = ""; // No image will be set
          }
        } catch (uploadError) {
          console.error("Firebase Storage upload error:", uploadError);
          // Instead of returning an error, allow registration to continue without image
          storeImageUrl = ""; // No image will be set
        }
      } else if (req.file.path) {
        // File was uploaded to disk (local environment), use its path
        storeImageUrl = req.file.path;
      }
    } else if (storeImage && storeImage.startsWith("http")) {
      // Image URL was provided directly
      storeImageUrl = storeImage;
    } else {
      // No image provided, set to empty string
      storeImageUrl = "";
    }

    // Use provided coordinates or default to 0,0 if not provided
    const storeCoordinates = coordinates
      ? {
          lat: coordinates.lat ? parseFloat(coordinates.lat) : 0,
          lng: coordinates.lng ? parseFloat(coordinates.lng) : 0,
        }
      : { lat: 0, lng: 0 };

    const store = new Store({
      name: storeName,
      categoryId: defaultCategory._id,
      ownerId: owner._id,
      image: storeImageUrl || "https://via.placeholder.com/400x400.png", // Provide default image if none uploaded
      phone: phone, // Use the owner's phone as store phone
      address: "العنوان غير محدد", // Provide default address instead of empty string
      description: storeDescription || "",
      coordinates: storeCoordinates,
      villageId: "village_not_set", // Provide default villageId instead of empty string
    });

    await store.save();

    // Update the owner with the storeId
    owner.storeId = store._id;
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
      message: "تم إنشاء حساب التاجر ومتجره بنجاح، في انتظار موافقة الإدارة",
    });
  } catch (error) {
    console.error("Register store owner error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const registerDriver = async (req, res) => {
  try {
    const { name, phone, password, vehicleType, vehicleNumber } = req.body;

    // Check if driver already exists with timeout
    const existingDriver = await Driver.findOne({ phone }).maxTimeMS(10000);
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
      vehicleType: vehicleType || "unknown", // Provide a default value if not present
      vehicleNumber: vehicleNumber || "N/A", // Provide a default value if not present
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
      await logLoginAttempt(
        phone,
        role,
        false,
        null,
        req,
        "Missing required fields"
      );
      return res
        .status(400)
        .json({ success: false, message: "يرجى تعبئة جميع الحقول" });
    }

    let user;
    let userType;

    switch (role) {
      case "customer":
        user = await User.findOne({ phone }).maxTimeMS(10000);
        userType = "customer";
        break;
      case "store":
        user = await StoreOwner.findOne({ phone }).maxTimeMS(10000);
        userType = "store";
        break;
      case "driver":
        user = await Driver.findOne({ phone }).maxTimeMS(10000);
        userType = "driver";
        break;
      default:
        await logLoginAttempt(phone, role, false, null, req, "Invalid role");
        return res
          .status(400)
          .json({ success: false, message: "نوع المستخدم غير صحيح" });
    }

    if (!user) {
      await logLoginAttempt(
        phone,
        userType || role,
        false,
        null,
        req,
        "User not found"
      );
      return res
        .status(401)
        .json({ success: false, message: "بيانات الدخول غير صحيحة" });
    }

    // For store owners, allow login but check verification status for operations
    if (userType === "store") {
      if (user.verificationStatus === "rejected") {
        await logLoginAttempt(
          phone,
          userType,
          false,
          user._id,
          req,
          "Store owner account rejected"
        );
        return res
          .status(401)
          .json({
            success: false,
            message: "الحساب مرفوض",
            verificationStatus: "rejected"
          });
      } else if (!user.isActive) {
        await logLoginAttempt(
          phone,
          userType,
          false,
          user._id,
          req,
          "Account not active"
        );
        return res
          .status(401)
          .json({ success: false, message: "الحساب غير نشط" });
      }
    } else if (!user.isActive) {
      await logLoginAttempt(
        phone,
        userType,
        false,
        user._id,
        req,
        "Account not active"
      );
      return res
        .status(401)
        .json({ success: false, message: "الحساب غير نشط" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await logLoginAttempt(
        phone,
        userType,
        false,
        user._id,
        req,
        "Invalid password"
      );
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

    // Log successful login
    await logLoginAttempt(phone, userType, true, user._id, req);

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
    // Log the error but don't reveal internal details to the user
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
