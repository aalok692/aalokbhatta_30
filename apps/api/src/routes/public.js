import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import * as controller from "../controllers/publicController.js";

const router = Router();
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many contact attempts. Please wait a while and try again." }
});

router.get("/settings", controller.getSettings);
router.get("/projects", controller.listProjects);
router.get("/projects/:slug", controller.getProject);
router.get("/posts", controller.listPosts);
router.get("/posts/:slug", controller.getPost);
router.get("/gallery", controller.listGallery);
router.post("/contact", contactLimiter, controller.submitContact);

export default router;
