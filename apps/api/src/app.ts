import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pino from "pino";
import { env } from "./config/env.js";
import authRouter from "./modules/auth/router.js";
import processRouter from "./modules/processes/router.js";
import { requireAuth } from "./security/auth.js";

const logger = pino({ level: env.NODE_ENV === "production" ? "info" : "debug" });

export function buildApp() {
  const app = express();
  const configuredOrigins = env.CORS_ORIGINS.split(",").map((item: string) => item.trim());

  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
      logger.info(
        {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt
        },
        "http_request"
      );
    });
    next();
  });
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        const isConfiguredOrigin = configuredOrigins.includes(origin);
        const isLocalDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

        if (isConfiguredOrigin || isLocalDevOrigin) {
          callback(null, true);
          return;
        }

        callback(new Error("Origem não permitida pelo CORS"));
      },
      credentials: true
    })
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: "draft-8",
      legacyHeaders: false
    })
  );

  app.get("/health", (_req, res) => {
    return res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/auth", authRouter);
  app.use("/processes", requireAuth, processRouter);

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ error }, "Erro interno");
    return res.status(500).json({ message: "Erro interno" });
  });

  return app;
}
