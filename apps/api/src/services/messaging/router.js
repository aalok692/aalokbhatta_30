import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { validateBody } from "../../middleware/validation.js";
import { createMessagingAdapter } from "./index.js";

const router = Router();
const adapter = createMessagingAdapter();
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

router.post("/messages", limiter, validateBody(z.object({
  visitorId: z.string().trim().min(16).max(100),
  message: z.string().trim().min(1).max(2000)
})), async (request, response, next) => {
  try {
    const result = await adapter.publish(request.body);
    response.status(202).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
