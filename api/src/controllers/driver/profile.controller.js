const Driver = require("../../models/Driver");

const getProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.userId).select("-password");

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: { driver },
      message: "تم جلب الملف الشخصي بنجاح",
    });
  } catch (error) {
    console.error("Get driver profile error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar, vehicleType, vehicleNumber } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      req.userId,
      {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(vehicleType && { vehicleType }),
        ...(vehicleNumber && { vehicleNumber }),
        updatedAt: Date.now(),
      },
      { new: true }
    ).select("-password");

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: { driver },
      message: "تم تحديث الملف الشخصي بنجاح",
    });
  } catch (error) {
    console.error("Update driver profile error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const driver = await Driver.findById(req.userId);

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "السائق غير موجود" });
    }

    // Toggle availability
    driver.isAvailable = !driver.isAvailable;
    await driver.save();

    res.status(200).json({
      success: true,
      data: { isAvailable: driver.isAvailable },
      message: driver.isAvailable
        ? "تم تفعيلك كمتاح للعمل"
        : "تم تعطيلك من العمل",
    });
  } catch (error) {
    console.error("Toggle driver availability error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  toggleAvailability,
};
