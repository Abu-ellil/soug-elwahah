const Store = require("../models/Store");
const StoreOwner = require("../models/StoreOwner");

// Get all stores with pending coordinate updates
const getStoresWithPendingCoordinates = async (req, res) => {
  try {
    const stores = await Store.find({ 
      pendingCoordinates: { $exists: true, $ne: null },
      'pendingCoordinates.lat': { $ne: null },
      'pendingCoordinates.lng': { $ne: null }
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

    if (!store.pendingCoordinates || !store.pendingCoordinates.lat || !store.pendingCoordinates.lng) {
      return res
        .status(400)
        .json({ success: false, message: "لا توجد إحداثيات معلقة لهذا المتجر" });
    }

    // Update the store's coordinates with the pending coordinates
    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        coordinates: {
          lat: store.pendingCoordinates.lat,
          lng: store.pendingCoordinates.lng
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
    res.status(50).json({ success: false, message: "خطأ في الخادم" });
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

    if (!store.pendingCoordinates || !store.pendingCoordinates.lat || !store.pendingCoordinates.lng) {
      return res
        .status(400)
        .json({ success: false, message: "لا توجد إحداثيات معلقة لهذا المتجر" });
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

module.exports = {
  getStoresWithPendingCoordinates,
  approveStoreCoordinates,
  rejectStoreCoordinates,
};