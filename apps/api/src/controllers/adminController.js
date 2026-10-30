import bcrypt from "bcryptjs";
import AdminUser from "../models/AdminUser.js";
import BlogPost from "../models/BlogPost.js";
import ContactMessage from "../models/ContactMessage.js";
import GalleryImage from "../models/GalleryImage.js";
import Project from "../models/Project.js";
import SiteSettings from "../models/SiteSettings.js";
import { settingsSchema } from "@aalokbhatta/shared";
import { deleteImage, saveImage } from "../services/storage/index.js";

const contentModels = { projects: Project, posts: BlogPost };

function readModel(type) {
  const model = contentModels[type];
  if (!model) {
    const error = new Error("Unknown content type.");
    error.statusCode = 404;
    throw error;
  }
  return model;
}

function publishedAtFor(document, published) {
  if (!published) return null;
  return document.publishedAt || new Date();
}

export async function login(request, response) {
  const email = String(request.body.email || "").trim().toLowerCase();
  const password = request.body.password;
  if (typeof password !== "string" || password.length > 200) {
    return response.status(400).json({ message: "Email and password are required." });
  }
  const admin = await AdminUser.findOne({ email });
  const valid = admin && await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return response.status(401).json({ message: "Email or password is incorrect." });
  await new Promise((resolve, reject) => {
    request.session.regenerate((error) => error ? reject(error) : resolve());
  });
  request.session.adminId = admin.id;
  await new Promise((resolve, reject) => {
    request.session.save((error) => error ? reject(error) : resolve());
  });
  return response.json({ admin: { email: admin.email } });
}

export function currentAdmin(request, response) {
  if (!request.session.adminId) return response.status(401).json({ message: "Admin sign-in is required." });
  return AdminUser.findById(request.session.adminId).select("email").lean()
    .then((admin) => admin ? response.json({ admin }) : response.status(401).json({ message: "Admin account no longer exists." }));
}

export async function logout(request, response) {
  if (!request.session) return response.status(204).end();
  await new Promise((resolve, reject) => {
    request.session.destroy((error) => error ? reject(error) : resolve());
  });
  response.clearCookie("aalok.sid");
  return response.status(204).end();
}

export async function listContent(request, response) {
  const model = readModel(request.params.type);
  const items = await model.find().sort({ updatedAt: -1 }).limit(200).lean();
  response.json({ items });
}

export async function createContent(request, response) {
  const model = readModel(request.params.type);
  const value = { ...request.body, publishedAt: request.body.published ? new Date() : null };
  const item = await model.create(value);
  response.status(201).json({ item });
}

export async function updateContent(request, response) {
  const model = readModel(request.params.type);
  const item = await model.findById(request.params.id);
  if (!item) return response.status(404).json({ message: "Content item not found." });
  Object.assign(item, request.body);
  item.publishedAt = publishedAtFor(item, request.body.published);
  await item.save();
  return response.json({ item });
}

export async function deleteContent(request, response) {
  const model = readModel(request.params.type);
  const item = await model.findByIdAndDelete(request.params.id);
  if (!item) return response.status(404).json({ message: "Content item not found." });
  return response.status(204).end();
}

export async function listMessages(request, response) {
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(200).lean();
  response.json({ messages });
}

export async function updateMessage(request, response) {
  const { read } = request.body;
  if (typeof read !== "boolean") return response.status(400).json({ message: "A boolean read value is required." });
  const item = await ContactMessage.findByIdAndUpdate(
    request.params.id,
    { read, status: read ? "read" : "new" },
    { new: true, runValidators: true }
  ).lean();
  if (!item) return response.status(404).json({ message: "Message not found." });
  return response.json({ item });
}

export async function deleteMessage(request, response) {
  const item = await ContactMessage.findByIdAndDelete(request.params.id);
  if (!item) return response.status(404).json({ message: "Message not found." });
  return response.status(204).end();
}

export async function uploadGalleryImage(request, response) {
  if (!request.file) return response.status(400).json({ message: "Choose an image to upload." });
  const stored = await saveImage(request.file);
  try {
    const item = await GalleryImage.create({
      title: request.body.title || "",
      caption: request.body.caption || "",
      description: request.body.description || "",
      category: request.body.category || "",
      alt: request.body.alt || "",
      imageUrl: stored.imageUrl,
      thumbnailUrl: stored.thumbnailUrl,
      storageKey: stored.storageKey
    });
    return response.status(201).json({ item });
  } catch (error) {
    await deleteImage(stored.storageKey);
    throw error;
  }
}

export async function deleteGalleryImage(request, response) {
  const item = await GalleryImage.findById(request.params.id);
  if (!item) return response.status(404).json({ message: "Gallery image not found." });
  await deleteImage(item.storageKey);
  await item.deleteOne();
  return response.status(204).end();
}

export async function getSettings(request, response) {
  const settings = await SiteSettings.findById("main").lean();
  response.json({ settings: settings || {
    introduction: "I’m Aalok Bhatta — a Civil Engineering graduate finding my way into software development, one thoughtful build at a time.",
    availability: "not-looking",
    socialLinks: { github: "", linkedin: "", email: "" },
    resumeUrl: "",
    about: { background: "", journey: "", education: "", experience: "", goals: "" }
  } });
}

export async function updateSettings(request, response) {
  const parsed = settingsSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: "Please review the submitted settings.", details: parsed.error.issues });
  }
  const settings = await SiteSettings.findByIdAndUpdate("main", parsed.data, { new: true, upsert: true, runValidators: true }).lean();
  return response.json({ settings });
}
