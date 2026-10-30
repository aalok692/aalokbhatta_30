import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  subject: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  read: { type: Boolean, default: false },
  status: { type: String, enum: ["new", "read", "archived"], default: "new" }
}, { timestamps: true });

contactMessageSchema.index({ read: 1, createdAt: -1 });

export default mongoose.model("ContactMessage", contactMessageSchema);
