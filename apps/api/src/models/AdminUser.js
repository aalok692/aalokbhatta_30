import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("AdminUser", adminUserSchema);
