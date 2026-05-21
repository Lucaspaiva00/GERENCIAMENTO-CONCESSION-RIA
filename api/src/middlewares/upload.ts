import multer from "multer";
import path from "path";

const uploadsDir = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const nomeArquivo = `${Date.now()}-${file.originalname}`;
        cb(null, nomeArquivo);
    }
});

export default multer({ storage });
