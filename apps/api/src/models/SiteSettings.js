import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: "main" },
  introduction: { type: String, default: "I’m Aalok Bhatta — a Civil Engineering graduate finding my way into software development, one thoughtful build at a time.", maxlength: 1000 },
  about: {
    background: { type: String, default: "", maxlength: 4000 },
    journey: { type: String, default: "", maxlength: 4000 },
    education: { type: String, default: "", maxlength: 2000 },
    experience: { type: String, default: "", maxlength: 4000 },
    goals: { type: String, default: "", maxlength: 4000 }
  },
  availability: { type: String, enum: ["available", "not-looking", "limited"], default: "not-looking" },
  socialLinks: {
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    email: { type: String, default: "" }
  },
  resumeUrl: { type: String, default: "" },
  aiEnabled: { type: Boolean, default: false },
  messagingEnabled: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("SiteSettings", siteSettingsSchema);
