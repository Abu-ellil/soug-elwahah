const Store = require("../../models/Store");
const Product = require("../../models/Product");
const Category = require("../../models/Category");

const getNearbyStores = async (req, res) => {
  try {
    const { lat, lng, radius = 10, categoryId } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ success: false, message: "يرجى تزويد الإحداثيات" });
    }

    console.log(`Searching for stores near: lat=${lat}, lng=${lng}, radius=${radius}km`);

    // Convert radius from km to meters for MongoDB query
    const radiusInMeters = parseFloat(radius) * 1000;

    let filter = {
      coordinates: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)],
            radiusInMeters / 6378100, // Earth's radius in meters
          ],
        },
      },
      isActive: true,
      isOpen: true,
    };

    // Add category filter if provided
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    console.log('Store filter:', JSON.stringify(filter, null, 2));

    const stores = await Store.find(filter)
      .populate("categoryId", "name nameEn icon color")
      .sort({ createdAt: -1 });

    console.log(`Found ${stores.length} stores near location`);

    res.status(200).json({
      success: true,
      data: { stores },
      message: "تم جلب المتاجر القريبة بنجاح",
    });
  } catch (error) {
    console.error("Get nearby stores error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const searchStores = async (req, res) => {
  try {
    const { query, villageId } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "يرجى تزويد نص البحث" });
    }

    let filter = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
      isActive: true,
      isOpen: true,
    };

    if (villageId) {
      filter.villageId = villageId;
    }

    const stores = await Store.find(filter)
      .populate("categoryId", "name nameEn icon color")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { stores },
      message: "تم جلب نتائج البحث بنجاح",
    });
  } catch (error) {
    console.error("Search stores error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getStoreDetails = async (req, res) => {
  try {
    const { storeId } = req.params;

    // Validate storeId parameter
    if (!storeId || storeId === 'undefined') {
      return res
        .status(400)
        .json({ success: false, message: "رقم المتجر مطلوب" });
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(storeId)) {
      return res
        .status(400)
        .json({ success: false, message: "رقم المتجر غير صحيح" });
    }

    const store = await Store.findById(storeId)
      .populate("categoryId", "name nameEn icon color")
      .populate("ownerId", "name phone");

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود" });
    }

    if (!store.isActive) {
      return res.status(404).json({ success: false, message: "المحل غير نشط" });
    }

    res.status(200).json({
      success: true,
      data: { store },
      message: "تم جلب تفاصيل المحل بنجاح",
    });
  } catch (error) {
    console.error("Get store details error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getStoreProducts = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { categoryId, search, page = 1, limit = 20 } = req.query;

    // Validate storeId parameter
    if (!storeId || storeId === 'undefined') {
      return res
        .status(400)
        .json({ success: false, message: "رقم المتجر مطلوب" });
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(storeId)) {
      return res
        .status(400)
        .json({ success: false, message: "رقم المتجر غير صحيح" });
    }

    // Check if store exists and is active
    const store = await Store.findById(storeId);
    if (!store || !store.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "المحل غير موجود أو غير نشط" });
    }

    let filter = {
      storeId,
      isAvailable: true,
      isActive: true,
    };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "تم جلب المنتجات بنجاح",
    });
  } catch (error) {
    console.error("Get store products error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const getAllStores = async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive, isOpen, categoryId } = req.query;

    let filter = {};
    
    // Add filters if provided
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (isOpen !== undefined) {
      filter.isOpen = isOpen === 'true';
    }
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const stores = await Store.find(filter)
      .populate("categoryId", "name nameEn icon color")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Store.countDocuments(filter);
    const pages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        stores,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages,
        },
      },
      message: "تم جلب جميع المتاجر بنجاح",
    });
  } catch (error) {
    console.error("Get all stores error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getNearbyStores,
  searchStores,
  getStoreDetails,
  getStoreProducts,
  getAllStores,
};
