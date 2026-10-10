import multer from "multer";
import path from "path";
import crypto from "crypto";
import { storagePaths } from "../config/storage.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storagePaths.content);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const safeBaseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 80);
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}-${safeBaseName}${extension}`;
    cb(null, uniqueName);
  }
});

const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 25);
const allowedExtensions = new Set((process.env.ALLOWED_FILE_EXTENSIONS || "pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,jpg,jpeg,png").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean));

export const uploadSingleFile = multer({
  storage,
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).slice(1).toLowerCase();
    if (!extension || !allowedExtensions.has(extension)) {
      const error = new Error(`File type is not allowed. Allowed types: ${[...allowedExtensions].join(", ")}`);
      error.statusCode = 400;
      return cb(error);
    }
    return cb(null, true);
  }
}).single("file");
