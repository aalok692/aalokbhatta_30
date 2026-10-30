import "../config/env.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import AdminUser from "../models/AdminUser.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment before creating the admin.");
  process.exitCode = 1;
} else if (password.length < 14 || password.length > 200) {
  console.error("ADMIN_PASSWORD must be between 14 and 200 characters.");
  process.exitCode = 1;
} else {
  try {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
    await mongoose.connect(process.env.MONGODB_URI);
    if (await AdminUser.exists({ email })) {
      throw new Error("An admin account with that email already exists. No account was changed.");
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await AdminUser.create({ email, passwordHash });
    console.info(`Admin account created for ${email}.`);
  } catch (error) {
    console.error("Admin account creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
