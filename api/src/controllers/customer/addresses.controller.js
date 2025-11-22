const Address = require("../../models/Address");

const getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: { addresses },
      message: "تم جلب العناوين بنجاح",
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const addAddress = async (req, res) => {
  try {
    const { type, details, coordinates, isDefault } = req.body;

    // If setting as default, remove default from other addresses
    if (isDefault) {
      await Address.updateMany({ userId: req.userId }, { isDefault: false });
    } else if (!isDefault) {
      // If no default address exists, make this one default
      const existingDefault = await Address.findOne({
        userId: req.userId,
        isDefault: true,
      });
      if (!existingDefault) {
        isDefault = true;
      }
    }

    const address = new Address({
      userId: req.userId,
      type,
      details,
      coordinates,
      isDefault: isDefault || false,
    });

    await address.save();

    res.status(201).json({
      success: true,
      data: { address },
      message: "تم إضافة العنوان بنجاح",
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { type, details, coordinates, isDefault } = req.body;

    // Find the address
    const address = await Address.findOne({
      _id: addressId,
      userId: req.userId,
    });
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "العنوان غير موجود" });
    }

    // If setting as default, remove default from other addresses
    if (isDefault) {
      await Address.updateMany({ userId: req.userId }, { isDefault: false });
    }

    // Update address
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        type,
        details,
        coordinates,
        isDefault: isDefault || false,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: { address: updatedAddress },
      message: "تم تحديث العنوان بنجاح",
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const address = await Address.findOne({
      _id: addressId,
      userId: req.userId,
    });
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "العنوان غير موجود" });
    }

    await Address.findByIdAndDelete(addressId);

    res.status(200).json({
      success: true,
      message: "تم حذف العنوان بنجاح",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
