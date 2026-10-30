import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import multer from "multer";
import { requireAdmin } from "../middleware/auth.js";
import * as controller from "../controllers/adminController.js";
import { projectSchema, postSchema } from "@aalokbhatta/shared";
import { validateBody } from "../middleware/validation.js";
import GalleryImage from "../models/GalleryImage.js";

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many sign-in attempts. Please wait and try again." }
});
const configuredUploadLimit = Number.parseInt(process.env.MAX_UPLOAD_MB || "8", 10);
const maxUploadBytes = Math.min(Math.max(configuredUploadLimit || 8, 1), 20) * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadBytes, files: 1 },
  fileFilter(request, file, callback) {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    if (!allowed.has(file.mimetype)) {
      const error = new Error("Only JPEG, PNG, WebP, or GIF images are supported.");
      error.statusCode = 400;
      return callback(error);
    }
    return callback(null, true);
  }
});

function validateContentType(request, response, next) {
  if (!["projects", "posts"].includes(request.params.type)) {
    return response.status(404).json({ message: "Content type not found." });
  }
  return next();
}

router.post("/auth/login", loginLimiter, controller.login);
router.get("/auth/me", controller.currentAdmin);
router.post("/auth/logout", controller.logout);
router.use(requireAdmin);
router.get("/settings", controller.getSettings);
router.put("/settings", controller.updateSettings);
router.get("/messages", controller.listMessages);
router.patch("/messages/:id", controller.updateMessage);
router.delete("/messages/:id", controller.deleteMessage);
router.get("/gallery", async (request, response, next) => {
  try {
    const items = await GalleryImage.find().sort({ createdAt: -1 }).limit(200).lean();
    response.json({ items });
  } catch (error) {
    next(error);
  }
});
router.post("/gallery", upload.single("image"), controller.uploadGalleryImage);
router.delete("/gallery/:id", controller.deleteGalleryImage);
router.get("/:type", validateContentType, controller.listContent);
router.post("/:type", validateContentType, (request, response, next) => {
  const schema = request.params.type === "projects" ? projectSchema : postSchema;
  return validateBody(schema)(request, response, next);
}, controller.createContent);
router.put("/:type/:id", validateContentType, (request, response, next) => {
  const schema = request.params.type === "projects" ? projectSchema : postSchema;
  return validateBody(schema)(request, response, next);
}, controller.updateContent);
router.delete("/:type/:id", validateContentType, controller.deleteContent);

export default router;
