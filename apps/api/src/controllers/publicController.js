import BlogPost from "../models/BlogPost.js";
import ContactMessage from "../models/ContactMessage.js";
import GalleryImage from "../models/GalleryImage.js";
import Project from "../models/Project.js";
import SiteSettings from "../models/SiteSettings.js";
import { contactSchema } from "@aalokbhatta/shared";

const defaultSettings = {
  introduction: "I’m Aalok Bhatta — a Civil Engineering graduate finding my way into software development, one thoughtful build at a time.",
  availability: "not-looking",
  about: { background: "", journey: "", education: "", experience: "", goals: "" },
  socialLinks: { github: "", linkedin: "", email: "" },
  resumeUrl: ""
};

function boundedLimit(value, fallback = 30) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 100) : fallback;
}

export async function getSettings(request, response) {
  const settings = await SiteSettings.findById("main")
    .select("introduction availability socialLinks resumeUrl about")
    .lean();
  response.json({ settings: settings ?? defaultSettings });
}

export async function listProjects(request, response) {
  const filter = { published: true };
  if (request.query.featured === "true") filter.featured = true;
  if (request.query.category) filter.category = String(request.query.category).slice(0, 60);
  const query = String(request.query.q || "").trim().slice(0, 100);
  if (query) filter.$text = { $search: query };
  const items = await Project.find(filter).sort({ featured: -1, publishedAt: -1, createdAt: -1 }).limit(boundedLimit(request.query.limit)).lean();
  response.json({ items });
}

export async function getProject(request, response) {
  const item = await Project.findOne({ slug: request.params.slug, published: true }).lean();
  if (!item) return response.status(404).json({ message: "Project not found." });
  return response.json({ item });
}

export async function listPosts(request, response) {
  const filter = { published: true };
  const query = String(request.query.q || "").trim().slice(0, 100);
  if (query) filter.$text = { $search: query };
  const items = await BlogPost.find(filter).sort({ publishedAt: -1, createdAt: -1 }).limit(boundedLimit(request.query.limit)).lean();
  response.json({ items });
}

export async function getPost(request, response) {
  const item = await BlogPost.findOne({ slug: request.params.slug, published: true }).lean();
  if (!item) return response.status(404).json({ message: "Journal note not found." });
  return response.json({ item });
}

export async function listGallery(request, response) {
  const filter = { published: true };
  if (request.query.category) filter.category = String(request.query.category).slice(0, 60);
  const items = await GalleryImage.find(filter).select("-storageKey -__v").sort({ createdAt: -1 }).limit(boundedLimit(request.query.limit)).lean();
  response.json({ items });
}

export async function submitContact(request, response) {
  const parsed = contactSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({
      message: "Please review the submitted fields.",
      details: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
    });
  }
  if (parsed.data.website) return response.status(202).json({ message: "Message received." });
  const { name, email, subject, message } = parsed.data;
  await ContactMessage.create({ name, email, subject, message });
  return response.status(201).json({ message: "Message received." });
}
