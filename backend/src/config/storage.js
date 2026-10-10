import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const backendRoot = path.resolve(__dirname, "..", "..");
export const uploadRoot = path.join(backendRoot, "uploads");

export const storagePaths = {
  content: path.join(uploadRoot, "content"),
  archive: path.join(uploadRoot, "archive"),
  deletion: path.join(uploadRoot, "deletion")
};

export const ensureStorageDirectories = () => {
  Object.values(storagePaths).forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true });
  });
};

export const getStoragePathForStatus = (status) => {
  return storagePaths[status] || storagePaths.content;
};

export const toRelativeStoragePath = (absolutePath) => {
  return path.relative(backendRoot, absolutePath).replace(/\\/g, "/");
};

export const toAbsoluteStoragePath = (relativePath) => {
  return path.resolve(backendRoot, relativePath);
};
