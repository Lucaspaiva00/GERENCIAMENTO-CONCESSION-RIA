import type { TipoUsuario } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            usuario: {
                usuarioid: number;
                lojaId: number;
                tipo: TipoUsuario;
            };
        }
    }
}

export {};
