const Store = require("../../models/Store");
const StoreOwner = require("../../models/StoreOwner");
const cloudinary = require("cloudinary").v2;
const admin = require("../../config/firebase");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getMyStore = async (req, res) => {
  try {
    // For backward compatibility, return the first approved store
    const store = await Store.findOne({ ownerId: req.userId, verificationStatus: 'approved' })
      .populate("categoryId", "name nameEn icon color")
      .populate("ownerId", "name phone");

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: { store },
      message: "تم جلب بيانات المحل بنجاح",
    });
  } catch (error) {
    console.error("Get my store error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const updateStore = async (req, res) => {
  try {
    const { name, description, phone, address, workingHours, image } = req.body;

    const store = await Store.findOne({ ownerId: req.userId });

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    // Update store
    const updatedStore = await Store.findOneAndUpdate(
      { ownerId: req.userId },
      {
        ...(name && { name }),
        ...(description && { description }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(workingHours && { workingHours }),
        ...(image && { image }),
        updatedAt: Date.now(),
      },
      { new: true }
    ).populate("categoryId", "name nameEn icon color");

    res.status(200).json({
      success: true,
      data: { store: updatedStore },
      message: "تم تحديث بيانات المحل بنجاح",
    });
  } catch (error) {
    console.error("Update store error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const updateStoreImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "الصورة مطلوبة" });
    }

    const store = await Store.findOne({ ownerId: req.userId });

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    let imageUrl = "";

    if (req.file.buffer) {
      // File is in memory (serverless environment), upload to Firebase Storage
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
        imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      } else {
        // Firebase not configured, return error
        return res.status(400).json({
          success: false,
          message: "لا يمكن رفع الصورة في الوقت الحالي",
        });
      }
    } else if (req.file.path) {
      // File was uploaded to disk (local environment), use Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "stores",
      });
      imageUrl = result.secure_url;
    }
    // Update store image
    const updatedStore = await Store.findOneAndUpdate(
      { ownerId: req.userId },
      { image: imageUrl, updatedAt: Date.now() },
      { new: true }
    ).populate("categoryId", "name nameEn icon color");

    res.status(200).json({
      success: true,
      data: { store: updatedStore },
      message: "تم تحديث صورة المحل بنجاح",
    });
  } catch (error) {
    console.error("Update store image error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const toggleStoreStatus = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.userId });

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    // Toggle store status
    store.isOpen = !store.isOpen;
    await store.save();

    res.status(200).json({
      success: true,
      data: { isOpen: store.isOpen },
      message: store.isOpen ? "تم فتح المحل بنجاح" : "تم إغلاق المحل بنجاح",
    });
  } catch (error) {
    console.error("Toggle store status error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get all public stores (no authentication required)
const getAllStores = async (req, res) => {
  try {
    const {
      categoryId,
      search,
      minRating,
      maxDeliveryTime,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query for public stores only
    let query = { isActive: true, isOpen: true };

    // Add filters if provided
    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (maxDeliveryTime) {
      query.maxDeliveryTime = { $lte: parseInt(maxDeliveryTime) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get stores with populated category info
    const stores = await Store.find(query)
      .populate("categoryId", "name nameEn icon color")
      .populate("ownerId", "name phone") // Only basic owner info
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await Store.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        stores,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      message: "تم جلب المتاجر بنجاح",
    });
  } catch (error) {
    console.error("Get all stores error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Update store coordinates function
const updateStoreCoordinates = async (req, res) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return res
        .status(400)
        .json({ success: false, message: "الإحداثيات مطلوبة" });
    }

    const store = await Store.findOne({ ownerId: req.userId });

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    // Update store coordinates - these will need admin approval before taking effect
    const updatedStore = await Store.findOneAndUpdate(
      { ownerId: req.userId },
      {
        pendingCoordinates: {
          lat: parseFloat(coordinates.lat),
          lng: parseFloat(coordinates.lng),
        },
        updatedAt: Date.now(),
      },
      { new: true }
    ).populate("categoryId", "name nameEn icon color");

    res.status(200).json({
      success: true,
      data: { store: updatedStore },
      message: "تم تحديث إحداثيات المتجر بنجاح، في انتظار موافقة الإدارة",
    });
  } catch (error) {
    console.error("Update store coordinates error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Create store application
const createStoreApplication = async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      address,
      coordinates,
      workingHours,
      deliveryFee,
      documents, // Array of document URLs
    } = req.body;

    // Get default category if not provided
    let storeCategoryId = categoryId;
    if (!storeCategoryId) {
      const defaultCategory = await require("../../models/Category").findOne().maxTimeMS(1000);
      if (!defaultCategory) {
        return res.status(400).json({
          success: false,
          message: "لا توجد فئات متاحة، يرجى الاتصال بالمسؤول",
        });
      }
      storeCategoryId = defaultCategory._id;
    }

    // Handle store image
    let storeImageUrl = "";
    if (req.file) {
      if (req.file.buffer) {
        // Upload to Firebase Storage
        const admin = require("../../config/firebase");
        if (admin && admin.storage) {
          const bucket = admin.storage().bucket();
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

          await file.makePublic();
          storeImageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        }
      } else if (req.file.path) {
        storeImageUrl = req.file.path;
      }
    }

    // Parse coordinates
    let storeCoordinates = { lat: 0, lng: 0 };
    if (coordinates) {
      if (typeof coordinates === 'string') {
        try {
          const parsed = JSON.parse(coordinates);
          storeCoordinates = {
            lat: parseFloat(parsed.lat) || 0,
            lng: parseFloat(parsed.lng) || 0,
          };
        } catch (e) {
          console.warn('Failed to parse coordinates:', coordinates);
        }
      } else {
        storeCoordinates = {
          lat: parseFloat(coordinates.lat) || 0,
          lng: parseFloat(coordinates.lng) || 0,
        };
      }
    }

    // Create store
    const store = new Store({
      name,
      categoryId: storeCategoryId,
      ownerId: req.userId,
      image: storeImageUrl || "https://via.placeholder.com/400x400.png",
      phone: req.userPhone, // From auth middleware
      address: address || "العنوان غير محدد",
      description: description || "",
      coordinates: storeCoordinates,
      villageId: "village_not_set",
      workingHours: workingHours || {
        from: '08:00',
        to: '23:00'
      },
      deliveryFee: deliveryFee || 10,
      documents: documents || [], // Store document URLs
    });

    await store.save();

    // Add store to owner's stores array
    await require("../../models/StoreOwner").findByIdAndUpdate(
      req.userId,
      { $push: { stores: store._id } }
    );

    res.status(201).json({
      success: true,
      data: { store },
      message: "تم تقديم طلب إنشاء المتجر بنجاح، في انتظار موافقة الإدارة",
    });
  } catch (error) {
    console.error("Create store application error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get all stores for the current owner
const getMyStores = async (req, res) => {
  try {
    const stores = await Store.find({ ownerId: req.userId })
      .populate("categoryId", "name nameEn icon color")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { stores },
      message: "تم جلب المتاجر بنجاح",
    });
  } catch (error) {
    console.error("Get my stores error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getMyStore,
  updateStore,
  updateStoreImage,
  toggleStoreStatus,
  getAllStores,
  updateStoreCoordinates,
  createStoreApplication,
  getMyStores,
};
