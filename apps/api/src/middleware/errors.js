export function notFoundHandler(request, response) {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.path}` });
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);
  if (error.statusCode === 403) {
    return response.status(403).json({ message: error.message });
  }
  if (error.status >= 400 && error.status < 500) {
    return response.status(error.status).json({ message: error.message });
  }
  if (error.name === "ValidationError") {
    return response.status(400).json({ message: "Invalid data.", details: error.message });
  }
  if (error.code === 11000) {
    return response.status(409).json({ message: "An item with that unique value already exists." });
  }
  if (error.name === "MulterError") {
    const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return response.status(status).json({ message: error.message });
  }
  console.error(error);
  return response.status(error.statusCode || 500).json({
    message: error.statusCode ? error.message : "An unexpected server error occurred."
  });
}
