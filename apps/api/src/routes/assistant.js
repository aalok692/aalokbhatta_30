import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { validateBody } from "../middleware/validation.js";
import { createAssistantAdapter } from "../services/assistant/index.js";

const router = Router();
const assistant = createAssistantAdapter();
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

router.post("/messages", limiter, validateBody(z.object({ message: z.string().trim().min(1).max(1000) })), async (request, response, next) => {
  try {
    const result = await assistant.respond(request.body.message);
    response.json({ message: result });
  } catch (error) {
    next(error);
  }
});

export default router;
