import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string().min(16),
  CORS_ORIGINS: z.string().default("http://localhost:5173")
});

export const env = envSchema.parse(process.env);
