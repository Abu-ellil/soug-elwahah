const StoreOwner = require("../../models/StoreOwner");

const getProfile = async (req, res) => {
  try {
    const owner = await StoreOwner.findById(req.userId)
      .populate(
        "storeId",
        "name image phone address description rating totalReviews isOpen deliveryTime deliveryFee coordinates villageId workingHours"
      )
      .select("-password");

    if (!owner) {
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: { owner, store: owner.storeId },
      message: "تم جلب الملف الشخصي بنجاح",
    });
  } catch (error) {
    console.error("Get store owner profile error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const owner = await StoreOwner.findByIdAndUpdate(
      req.userId,
      {
        ...(name && { name }),
        updatedAt: Date.now(),
      },
      { new: true }
    ).select("-password");

    if (!owner) {
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: { owner },
      message: "تم تحديث الملف الشخصي بنجاح",
    });
  } catch (error) {
    console.error("Update store owner profile error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
