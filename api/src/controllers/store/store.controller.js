const Store = require("../../models/Store");
const StoreOwner = require("../../models/StoreOwner");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.userId })
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
    const { name, description, phone, address, workingHours } = req.body;

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

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "stores",
    });

    // Update store image
    const updatedStore = await Store.findOneAndUpdate(
      { ownerId: req.userId },
      { image: result.secure_url, updatedAt: Date.now() },
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
    const { categoryId, search, minRating, maxDeliveryTime, page = 1, limit = 10 } = req.query;
    
    // Build query for public stores only
    let query = { isActive: true, isOpen: true };
    
    // Add filters if provided
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
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
      .populate('categoryId', 'name nameEn icon color')
      .populate('ownerId', 'name phone') // Only basic owner info
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
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'تم جلب المتاجر بنجاح'
    });
  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
};

module.exports = {
  getMyStore,
  updateStore,
  updateStoreImage,
  toggleStoreStatus,
  getAllStores,
};
