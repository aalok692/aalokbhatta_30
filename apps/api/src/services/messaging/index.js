export function createMessagingAdapter() {
  return {
    get enabled() {
      return process.env.MESSAGING_ENABLED === "true";
    },
    get provider() {
      return process.env.MESSAGING_PROVIDER || "";
    },
    async publish(message) {
      if (!this.enabled) {
        const error = new Error("Real-time messaging is not enabled.");
        error.statusCode = 503;
        throw error;
      }
      if (!this.provider || !process.env.MESSAGING_API_KEY) {
        const error = new Error("The messaging provider is not configured.");
        error.statusCode = 503;
        throw error;
      }
      if (!message?.visitorId || !message?.message) {
        const error = new Error("A visitor identity and message are required.");
        error.statusCode = 400;
        throw error;
      }
      const error = new Error(`The configured messaging provider "${this.provider}" does not have an adapter yet.`);
      error.statusCode = 501;
      throw error;
    }
  };
}
