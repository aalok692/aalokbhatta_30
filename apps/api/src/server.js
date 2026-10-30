import "./config/env.js";
import connectDatabase from "./config/database.js";

const port = Number.parseInt(process.env.API_PORT || "4000", 10);

try {
  await connectDatabase();
  const { default: app } = await import("./app.js");
  app.listen(port, () => {
    console.info(`API listening on port ${port}.`);
  });
} catch (error) {
  console.error("API startup failed:", error.message);
  process.exitCode = 1;
}
