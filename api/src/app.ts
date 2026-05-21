import cors from "cors";
import express from "express";
import path from "path";
import routes from "./routes";

const app = express();

const uploadsDir = path.join(__dirname, "..", "uploads");

app.use(cors());
app.use(express.json());
app.use("/files", express.static(uploadsDir));
app.use(routes);

export default app;
