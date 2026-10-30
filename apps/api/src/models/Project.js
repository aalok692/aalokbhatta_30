import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 140 },
  summary: { type: String, required: true, trim: true, maxlength: 300 },
  description: { type: String, default: "", maxlength: 12000 },
  imageUrl: { type: String, default: "" },
  technologies: { type: [String], default: [] },
  githubUrl: { type: String, default: "" },
  liveUrl: { type: String, default: "" },
  category: { type: String, default: "", trim: true, maxlength: 60 },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null }
}, { timestamps: true });

projectSchema.index({ published: 1, featured: 1, publishedAt: -1 });
projectSchema.index({ title: "text", summary: "text", category: "text" });

export default mongoose.model("Project", projectSchema);
