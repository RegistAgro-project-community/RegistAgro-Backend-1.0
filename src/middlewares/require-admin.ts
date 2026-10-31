import type { NextFunction, Request, Response } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }
  if (req.user.rule !== "admin") {
    res.status(403).json({ error: "Acesso não autorizado" });
    return;
  }
  next();
}
