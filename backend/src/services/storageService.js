import { createReadStream } from "fs";
import { unlink } from "fs/promises";
import { pipeline } from "stream/promises";
import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";

const bucket = () => {
  if (!mongoose.connection.db) throw new Error("Database connection is unavailable for file storage");
  return new GridFSBucket(mongoose.connection.db, { bucketName: "sifsFiles" });
};

export const useGridFS = () => process.env.FILE_STORAGE_MODE === "gridfs";

export const uploadToGridFS = async ({ localPath, storedName, mimeType }) => {
  const uploadStream = bucket().openUploadStream(storedName, { metadata: { mimeType } });
  await pipeline(createReadStream(localPath), uploadStream);
  await unlink(localPath).catch(() => {});
  return uploadStream.id;
};

export const sendGridFSFile = async (res, file) => {
  if (!file.gridFsId) {
    const error = new Error("The stored file binary is unavailable");
    error.statusCode = 404;
    throw error;
  }
  res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`);
  await pipeline(bucket().openDownloadStream(new ObjectId(file.gridFsId)), res);
};

export const deleteGridFSFile = async (gridFsId) => {
  if (!gridFsId) return;
  await bucket().delete(new ObjectId(gridFsId)).catch((error) => {
    if (error?.code !== "ENOENT" && error?.message !== "FileNotFound") throw error;
  });
};
