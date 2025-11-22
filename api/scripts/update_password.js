#!/usr/bin/env node

require("dotenv").config();
const connectDB = require("../src/config/database");
const StoreOwner = require("../src/models/StoreOwner");
const Store = require("../src/models/Store");
const Category = require("../src/models/Category");
const bcrypt = require("bcryptjs");

const updatePassword = async () => {
  try {
    await connectDB();

    const phone = "1221089249";
    const newPassword = "111111";

    let user = await StoreOwner.findOne({ phone });
    if (!user) {
      console.log("User not found, creating new user");
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user = new StoreOwner({
        name: "API also ava",
        phone,
        password: hashedPassword,
        stores: [],
        isActive: true,
        verificationStatus: "approved",
        rejectionReason: null,
        fcmToken: null,
      });
      await user.save();
      console.log("User created successfully");
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();
      console.log("Password updated successfully");
    }

    console.log("New hash:", user.password);

    process.exit(0);
  } catch (error) {
    console.error("Error updating password:", error);
    process.exit(1);
  }
};

updatePassword();