import type{ Request, Response } from "express";

export function healthyRoute(req: Request, res: Response){
    return res.status(200).json({ok: "API is running"})
}
