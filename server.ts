import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { authMiddleware, requestLogger } from "./server/middleware";
import * as authController from "./server/authController";
import * as topicController from "./server/topicController";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // General middlewares
  app.use(express.json());
  app.use(requestLogger);

  // --- API Endpoints ---
  
  // Authentication Routes
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/login", authController.login);
  app.get("/api/auth/profile", authMiddleware, authController.getProfile);

  // Topics CRUD & Tracking Routes
  app.get("/api/topics", authMiddleware, topicController.getTopics);
  app.get("/api/topics/:id", authMiddleware, topicController.getTopicById);
  app.post("/api/topics", authMiddleware, topicController.createTopic);
  app.put("/api/topics/:id", authMiddleware, topicController.updateTopic);
  app.delete("/api/topics/:id", authMiddleware, topicController.deleteTopic);

  // Statistics Dashboard Route
  app.get("/api/stats", authMiddleware, topicController.getDashboardStats);

  // Health probe
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // --- Vite Dev Integration and Production Static Assets Serving ---
  
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite middleware... (Port 3000)");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    // Use Vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode... serving compiled assets.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 LearnVault Full-Stack Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server bootstrap error:", err);
});
