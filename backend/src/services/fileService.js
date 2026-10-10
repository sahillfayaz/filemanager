import fs from "fs/promises";
import path from "path";
import File from "../models/File.js";
import Metadata from "../models/Metadata.js";
import FileContext from "../models/FileContext.js";
import FileShare from "../models/FileShare.js";
import { generateSHA256 } from "./hashService.js";
import { createActivityLog } from "./activityService.js";
import { ACTIVITY_ACTIONS, ENTITY_TYPES, FILE_STATUS } from "../utils/constants.js";
import { getStoragePathForStatus, toAbsoluteStoragePath, toRelativeStoragePath } from "../config/storage.js";
import { normalizeText, parseTags, parseMetadataInput } from "../utils/response.js";

const buildMetadataRecords = (fileId, metadataItems = []) => {
  return metadataItems
    .filter((item) => item && item.key && item.value)
    .map((item) => ({
      fileId,
      key: String(item.key).trim(),
      value: String(item.value).trim(),
      normalizedKey: normalizeText(item.key),
      normalizedValue: normalizeText(item.value)
    }));
};

export const hydrateFile = async (file) => {
  if (!file) return null;

  const [metadata, context] = await Promise.all([
    Metadata.find({ fileId: file._id }).sort({ key: 1 }),
    FileContext.findOne({ fileId: file._id })
  ]);

  return {
    ...file.toObject(),
    metadata,
    context
  };
};

export const createFileFromUpload = async ({ uploadedFile, body }) => {
  if (!uploadedFile) {
    const error = new Error("No file uploaded. Use multipart/form-data field name 'file'.");
    error.statusCode = 400;
    throw error;
  }

  const sha256Hash = await generateSHA256(uploadedFile.path);
  const duplicate = await File.findOne({ sha256Hash }).sort({ createdAt: 1 });
  const uploadedBy = body.uploadedBy || process.env.DEFAULT_USER || "System User";

  const file = await File.create({
    originalName: uploadedFile.originalname,
    storedName: uploadedFile.filename,
    mimeType: uploadedFile.mimetype,
    size: uploadedFile.size,
    extension: path.extname(uploadedFile.originalname).replace(".", "").toLowerCase(),
    sha256Hash,
    storagePath: toRelativeStoragePath(uploadedFile.path),
    status: FILE_STATUS.CONTENT,
    uploadedBy,
    description: body.description || "",
    duplicateOf: duplicate?._id || null
  });

  const context = await FileContext.create({
    fileId: file._id,
    employee: body.employee || "",
    department: body.department || "",
    event: body.event || "",
    year: body.year || "",
    category: body.category || "",
    tags: parseTags(body.tags)
  });

  const metadataInput = parseMetadataInput(body.metadata);
  const contextMetadata = [
    ["Employee", body.employee],
    ["Department", body.department],
    ["Event", body.event],
    ["Year", body.year],
    ["Category", body.category]
  ]
    .filter(([, value]) => value)
    .map(([key, value]) => ({ key, value }));

  const metadataRecords = buildMetadataRecords(file._id, [...contextMetadata, ...metadataInput]);
  if (metadataRecords.length > 0) {
    await Metadata.insertMany(metadataRecords);
  }

  await createActivityLog({
    action: duplicate ? ACTIVITY_ACTIONS.DUPLICATE_FILE_UPLOADED : ACTIVITY_ACTIONS.FILE_UPLOADED,
    entityType: ENTITY_TYPES.FILE,
    entityId: file._id,
    performedBy: uploadedBy,
    message: duplicate
      ? `Duplicate file uploaded: ${file.originalName}`
      : `File uploaded: ${file.originalName}`,
    metadata: {
      sha256Hash,
      duplicateOf: duplicate?._id || null,
      contextId: context._id
    }
  });

  return hydrateFile(file);
};

export const listFilesByStatus = async ({ status = FILE_STATUS.CONTENT, page = 1, limit = 20 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    File.find({ status }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    File.countDocuments({ status })
  ]);

  const hydratedItems = await Promise.all(items.map((file) => hydrateFile(file)));

  return {
    items: hydratedItems,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)) || 1
    }
  };
};

export const getFileById = async (id) => {
  const file = await File.findById(id);
  if (!file) {
    const error = new Error("File not found");
    error.statusCode = 404;
    throw error;
  }

  return hydrateFile(file);
};

export const getFileDocumentById = async (id) => {
  const file = await File.findById(id);
  if (!file) {
    const error = new Error("File not found");
    error.statusCode = 404;
    throw error;
  }
  return file;
};

export const moveFileToStatus = async ({ id, status, performedBy }) => {
  const file = await getFileDocumentById(id);
  const oldAbsolutePath = toAbsoluteStoragePath(file.storagePath);
  const targetDirectory = getStoragePathForStatus(status);
  const targetAbsolutePath = path.join(targetDirectory, file.storedName);

  if (file.status !== status) {
    await fs.rename(oldAbsolutePath, targetAbsolutePath);
    file.status = status;
    file.storagePath = toRelativeStoragePath(targetAbsolutePath);
    await file.save();
  }

  const actionByStatus = {
    [FILE_STATUS.CONTENT]: ACTIVITY_ACTIONS.FILE_RESTORED,
    [FILE_STATUS.ARCHIVE]: ACTIVITY_ACTIONS.FILE_ARCHIVED,
    [FILE_STATUS.DELETION]: ACTIVITY_ACTIONS.FILE_MOVED_TO_DELETION
  };

  await createActivityLog({
    action: actionByStatus[status],
    entityType: ENTITY_TYPES.FILE,
    entityId: file._id,
    performedBy: performedBy || process.env.DEFAULT_USER || "System User",
    message: `File moved to ${status} space: ${file.originalName}`,
    metadata: { status }
  });

  return hydrateFile(file);
};

export const permanentlyDeleteFile = async ({ id, performedBy }) => {
  const file = await getFileDocumentById(id);

  if (file.status !== FILE_STATUS.DELETION) {
    const error = new Error("Only files in deletion space can be permanently deleted");
    error.statusCode = 400;
    throw error;
  }

  const absolutePath = toAbsoluteStoragePath(file.storagePath);
  await fs.unlink(absolutePath).catch((err) => {
    if (err.code !== "ENOENT") throw err;
  });

  await Promise.all([
    Metadata.deleteMany({ fileId: file._id }),
    FileContext.deleteOne({ fileId: file._id }),
    FileShare.deleteMany({ fileId: file._id }),
    File.deleteOne({ _id: file._id })
  ]);

  await createActivityLog({
    action: ACTIVITY_ACTIONS.FILE_PERMANENTLY_DELETED,
    entityType: ENTITY_TYPES.FILE,
    entityId: file._id,
    performedBy: performedBy || process.env.DEFAULT_USER || "System User",
    message: `File permanently deleted: ${file.originalName}`,
    metadata: {
      sha256Hash: file.sha256Hash,
      originalName: file.originalName
    }
  });

  return file;
};

export const buildContextQuery = (query) => {
  const contextQuery = {};

  ["employee", "department", "event", "year", "category"].forEach((field) => {
    if (query[field]) {
      contextQuery[`normalized.${field}`] = normalizeText(query[field]);
    }
  });

  if (query.tag) {
    contextQuery["normalized.tags"] = normalizeText(query.tag);
  }

  return contextQuery;
};
