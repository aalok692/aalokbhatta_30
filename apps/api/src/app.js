import { fileURLToPath } from "node:url";
import connectMongo from "connect-mongo";
import cors from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import mongoose from "mongoose";
import adminRoutes from "./routes/admin.js";
import assistantRoutes from "./routes/assistant.js";
import publicRoutes from "./routes/public.js";
import messagingRoutes from "./services/messaging/router.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";
import { verifyRequestOrigin } from "./middleware/csrf.js";

const app = express();
const uploadDirectory = fileURLToPath(new URL("../uploads/", import.meta.url));
const allowedOrigins = (process.env.WEB_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      "img-src": ["'self'", "data:", "https:"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
      "connect-src": ["'self'", ...allowedOrigins]
    }
  }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error("Origin is not allowed by CORS.");
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
app.use(express.json({ limit: "32kb" }));
app.use(verifyRequestOrigin);

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must be set to a random value at least 32 characters long.");
}
app.use(session({
  name: "aalok.sid",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: connectMongo.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
    ttl: 60 * 60 * 24 * 7
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.get("/api/health", (request, response) => {
  response.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/messaging", messagingRoutes);
app.use("/uploads", express.static(uploadDirectory, {
  fallthrough: false,
  index: false,
  dotfiles: "deny",
  maxAge: "1d",
  setHeaders(response) {
    response.setHeader("X-Content-Type-Options", "nosniff");
  }
}));
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
