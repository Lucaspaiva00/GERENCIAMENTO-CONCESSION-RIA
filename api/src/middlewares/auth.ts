import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    usuarioid: number;
    lojaId: number;
    tipo: Request["usuario"]["tipo"];
}

export default async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: "Token não informado"
            });
        }

        const [, token] = authHeader.split(" ");

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        req.usuario = {
            usuarioid: decoded.usuarioid,
            lojaId: decoded.lojaId,
            tipo: decoded.tipo
        };

        next();
    } catch {
        return res.status(401).json({
            error: "Token inválido"
        });
    }
};
