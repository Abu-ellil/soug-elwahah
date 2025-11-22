const User = require("../../models/User");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: { user },
      message: "تم جلب الملف الشخصي بنجاح",
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(name && { name }),
        ...(avatar && { avatar }),
        updatedAt: Date.now(),
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: { user },
      message: "تم تحديث الملف الشخصي بنجاح",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
