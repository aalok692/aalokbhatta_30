export function requireAdmin(request, response, next) {
  if (!request.session?.adminId) {
    return response.status(401).json({ message: "Admin sign-in is required." });
  }
  return next();
}
