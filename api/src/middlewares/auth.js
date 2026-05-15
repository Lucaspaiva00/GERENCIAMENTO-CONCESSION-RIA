const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({
                error: "Token não informado"
            });

        }

        const [, token] =
            authHeader.split(" ");

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = {
            usuarioid: decoded.usuarioid,
            lojaId: decoded.lojaId
        };

        next();

    } catch (error) {

        return res.status(401).json({
            error: "Token inválido"
        });

    }

};