import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import type { User, UserRole } from "../types.js";

type TokenPayload = {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
};

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function signToken(user: User) {
  return jwt.sign(
    {
      name: user.name,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    {
      subject: user.id,
      expiresIn: "8h"
    }
  );
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token ausente" });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    return next();
  };
}
