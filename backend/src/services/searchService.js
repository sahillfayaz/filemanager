import File from "../models/File.js";
import Metadata from "../models/Metadata.js";
import FileContext from "../models/FileContext.js";
import { createActivityLog } from "./activityService.js";
import { hydrateFile, buildContextQuery } from "./fileService.js";
import { ACTIVITY_ACTIONS, ENTITY_TYPES, FILE_STATUS } from "../utils/constants.js";
import { normalizeText } from "../utils/response.js";

export const generalSearch = async ({ query, status = FILE_STATUS.CONTENT, performedBy }) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const matchingMetadata = await Metadata.find({
    $or: [
      { normalizedKey: { $regex: normalizedQuery, $options: "i" } },
      { normalizedValue: { $regex: normalizedQuery, $options: "i" } }
    ]
  }).select("fileId");

  const matchingContexts = await FileContext.find({
    $or: [
      { "normalized.employee": { $regex: normalizedQuery, $options: "i" } },
      { "normalized.department": { $regex: normalizedQuery, $options: "i" } },
      { "normalized.event": { $regex: normalizedQuery, $options: "i" } },
      { "normalized.year": { $regex: normalizedQuery, $options: "i" } },
      { "normalized.category": { $regex: normalizedQuery, $options: "i" } },
      { "normalized.tags": { $regex: normalizedQuery, $options: "i" } }
    ]
  }).select("fileId");

  const relatedFileIds = [
    ...matchingMetadata.map((item) => item.fileId),
    ...matchingContexts.map((item) => item.fileId)
  ];

  const files = await File.find({
    status,
    $or: [
      { _id: { $in: relatedFileIds } },
      { originalName: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { sha256Hash: { $regex: normalizedQuery, $options: "i" } }
    ]
  }).sort({ createdAt: -1 });

  await createActivityLog({
    action: ACTIVITY_ACTIONS.FILE_SEARCHED,
    entityType: ENTITY_TYPES.SYSTEM,
    performedBy: performedBy || process.env.DEFAULT_USER || "System User",
    message: `General search performed: ${query}`,
    metadata: { query, status, resultCount: files.length }
  });

  return Promise.all(files.map((file) => hydrateFile(file)));
};

export const contextSearch = async ({ query, status = FILE_STATUS.CONTENT, performedBy }) => {
  const contextQuery = buildContextQuery(query);

  if (Object.keys(contextQuery).length === 0) {
    const error = new Error("At least one context query is required");
    error.statusCode = 400;
    throw error;
  }

  const contexts = await FileContext.find(contextQuery).select("fileId");
  const fileIds = contexts.map((context) => context.fileId);
  const files = await File.find({ _id: { $in: fileIds }, status }).sort({ createdAt: -1 });

  await createActivityLog({
    action: ACTIVITY_ACTIONS.FILE_SEARCHED,
    entityType: ENTITY_TYPES.SYSTEM,
    performedBy: performedBy || process.env.DEFAULT_USER || "System User",
    message: "Context search performed",
    metadata: { query, status, resultCount: files.length }
  });

  return Promise.all(files.map((file) => hydrateFile(file)));
};

export const hashSearch = async ({ sha256Hash, performedBy }) => {
  const files = await File.find({ sha256Hash }).sort({ createdAt: -1 });

  await createActivityLog({
    action: ACTIVITY_ACTIONS.HASH_SEARCHED,
    entityType: ENTITY_TYPES.SYSTEM,
    performedBy: performedBy || process.env.DEFAULT_USER || "System User",
    message: `Hash search performed: ${sha256Hash}`,
    metadata: { sha256Hash, resultCount: files.length }
  });

  return Promise.all(files.map((file) => hydrateFile(file)));
};
