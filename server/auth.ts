import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

declare global {
  namespace Express {
    interface Request {
      operatorId?: string;
      operator?: { id: string; name: string; initials: string };
    }
  }
}

const sessions = new Map<string, { operatorId: string; expiresAt: number }>();

export function generateToken(): string {
  return randomUUID();
}

export function createSession(operatorId: string): string {
  const token = generateToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  sessions.set(token, { operatorId, expiresAt });
  return token;
}

export function validateToken(token: string): string | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session.operatorId;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized - no token" });
  }

  const operatorId = validateToken(token);
  if (!operatorId) {
    return res.status(401).json({ error: "Unauthorized - invalid token" });
  }

  req.operatorId = operatorId;
  next();
}
