import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
  excerpt: { type: String, default: "", trim: true, maxlength: 400 },
  body: { type: String, required: true, maxlength: 30000 },
  category: { type: String, default: "", trim: true, maxlength: 80 },
  tags: { type: [String], default: [] },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null }
}, { timestamps: true });

blogPostSchema.index({ published: 1, publishedAt: -1 });
blogPostSchema.index({ title: "text", excerpt: "text", category: "text", tags: "text" });

export default mongoose.model("BlogPost", blogPostSchema);
