export function createAssistantAdapter() {
  const enabled = process.env.AI_ENABLED === "true";
  const provider = process.env.AI_PROVIDER || "";
  const apiKey = process.env.AI_API_KEY || "";

  return {
    async respond(question) {
      if (!enabled) {
        const error = new Error("The personal assistant is not enabled.");
        error.statusCode = 503;
        throw error;
      }
      if (!provider || !apiKey) {
        const error = new Error("The assistant provider is not configured.");
        error.statusCode = 503;
        throw error;
      }
      const error = new Error(`The configured assistant provider "${provider}" does not have an adapter yet.`);
      error.statusCode = 501;
      throw error;
    }
  };
}
