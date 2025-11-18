#!/usr/bin/env node

require("dotenv").config();
const connectDB = require("../src/config/database");
const StoreOwner = require("../src/models/StoreOwner");
const bcrypt = require("bcryptjs");

const updatePassword = async () => {
  try {
    await connectDB();

    const phone = "01221089249";
    const newPassword = "111111";

    const user = await StoreOwner.findOne({ phone });
    if (!user) {
      console.log("User not found");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    console.log("Password updated successfully");
    console.log("New hash:", hashedPassword);

    process.exit(0);
  } catch (error) {
    console.error("Error updating password:", error);
    process.exit(1);
  }
};

updatePassword();