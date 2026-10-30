const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function verifyRequestOrigin(request, response, next) {
  if (!unsafeMethods.has(request.method)) return next();
  const allowedOrigins = (process.env.WEB_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (!request.headers.origin || !allowedOrigins.includes(request.headers.origin)) {
    return response.status(403).json({ message: "Request origin is not allowed." });
  }
  return next();
}
