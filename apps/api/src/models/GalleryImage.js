import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema({
  title: { type: String, default: "", trim: true, maxlength: 120 },
  caption: { type: String, default: "", trim: true, maxlength: 300 },
  description: { type: String, default: "", trim: true, maxlength: 1000 },
  alt: { type: String, default: "", trim: true, maxlength: 300 },
  category: { type: String, default: "", trim: true, maxlength: 60 },
  imageUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  storageKey: { type: String, required: true, unique: true },
  published: { type: Boolean, default: true },
  album: { type: String, default: "", trim: true, maxlength: 80 }
}, { timestamps: true });

galleryImageSchema.index({ published: 1, category: 1, createdAt: -1 });

export default mongoose.model("GalleryImage", galleryImageSchema);
