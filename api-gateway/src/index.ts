import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

//load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// trust proxy (important for reverse proxies)
app.set("trust proxy", 1);

// setup middlewares
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: process.env.CORS_CREDENTIALS === "true",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-user-id",
      "x-user-email",
    ],
  })
);

// parse JSON bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// auth middlware
app.use(gatewayAuth);

// setup proxy routes
app.use(proxyRoutes);

//Gloval error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.log("Unhandled eeror:", error);

    if (!res.headersSent) {
      res
        .status(error.statusCode || 500)
        .json(createErrorResponse(error.message || "Internal eror"));
    }
  }
);

// Start server
const server = app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log("");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down API Gateway...");
  server.close(() => {
    console.log(" API Gateway shut down gracefully.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("Shutting down API Gateway...");
  server.close(() => {
    console.log("API Gateway shut down gracefully.");
    process.exit(0);
  });
});

export default app;
