export function validateBody(schema) {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      return response.status(400).json({
        message: "Please review the submitted fields.",
        details: result.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
      });
    }
    request.body = result.data;
    return next();
  };
}
