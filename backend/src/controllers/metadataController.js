import Metadata from "../models/Metadata.js";
import FileContext from "../models/FileContext.js";
import { getFileDocumentById } from "../services/fileService.js";
import { createActivityLog } from "../services/activityService.js";
import { ACTIVITY_ACTIONS, ENTITY_TYPES } from "../utils/constants.js";
import { normalizeText, successResponse } from "../utils/response.js";

export const getMetadataByFile = async (req, res, next) => {
  try {
    await getFileDocumentById(req.params.fileId);
    const metadata = await Metadata.find({ fileId: req.params.fileId }).sort({ key: 1 });
    return successResponse(res, metadata, "Metadata fetched successfully");
  } catch (error) {
    return next(error);
  }
};

export const addMetadataToFile = async (req, res, next) => {
  try {
    await getFileDocumentById(req.params.fileId);
    const items = Array.isArray(req.body.items)
      ? req.body.items
      : [{ key: req.body.key, value: req.body.value }];

    const records = items
      .filter((item) => item.key && item.value)
      .map((item) => ({
        fileId: req.params.fileId,
        key: String(item.key).trim(),
        value: String(item.value).trim(),
        normalizedKey: normalizeText(item.key),
        normalizedValue: normalizeText(item.value)
      }));

    if (records.length === 0) {
      const error = new Error("At least one metadata key/value pair is required");
      error.statusCode = 400;
      throw error;
    }

    const metadata = await Metadata.insertMany(records);

    await createActivityLog({
      action: ACTIVITY_ACTIONS.METADATA_CREATED,
      entityType: ENTITY_TYPES.FILE,
      entityId: req.params.fileId,
      performedBy: req.body.performedBy || process.env.DEFAULT_USER || "System User",
      message: "Metadata added to file",
      metadata: { records }
    });

    return successResponse(res, metadata, "Metadata added successfully", 201);
  } catch (error) {
    return next(error);
  }
};

export const updateMetadata = async (req, res, next) => {
  try {
    const metadata = await Metadata.findById(req.params.id);
    if (!metadata) {
      const error = new Error("Metadata not found");
      error.statusCode = 404;
      throw error;
    }

    metadata.key = req.body.key ?? metadata.key;
    metadata.value = req.body.value ?? metadata.value;
    await metadata.save();

    await createActivityLog({
      action: ACTIVITY_ACTIONS.METADATA_UPDATED,
      entityType: ENTITY_TYPES.METADATA,
      entityId: metadata._id,
      performedBy: req.body.performedBy || process.env.DEFAULT_USER || "System User",
      message: "Metadata updated",
      metadata: { fileId: metadata.fileId, key: metadata.key, value: metadata.value }
    });

    return successResponse(res, metadata, "Metadata updated successfully");
  } catch (error) {
    return next(error);
  }
};

export const deleteMetadata = async (req, res, next) => {
  try {
    const metadata = await Metadata.findByIdAndDelete(req.params.id);
    if (!metadata) {
      const error = new Error("Metadata not found");
      error.statusCode = 404;
      throw error;
    }

    await createActivityLog({
      action: ACTIVITY_ACTIONS.METADATA_DELETED,
      entityType: ENTITY_TYPES.METADATA,
      entityId: metadata._id,
      performedBy: req.body.performedBy || process.env.DEFAULT_USER || "System User",
      message: "Metadata deleted",
      metadata: { fileId: metadata.fileId, key: metadata.key, value: metadata.value }
    });

    return successResponse(res, metadata, "Metadata deleted successfully");
  } catch (error) {
    return next(error);
  }
};

export const updateFileContext = async (req, res, next) => {
  try {
    await getFileDocumentById(req.params.fileId);

    const context = await FileContext.findOne({ fileId: req.params.fileId });
    if (!context) {
      const error = new Error("File context not found");
      error.statusCode = 404;
      throw error;
    }

    ["employee", "department", "event", "year", "category"].forEach((field) => {
      if (req.body[field] !== undefined) {
        context[field] = req.body[field];
      }
    });

    if (req.body.tags !== undefined) {
      context.tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : String(req.body.tags).split(",").map((tag) => tag.trim()).filter(Boolean);
    }

    await context.save();

    await createActivityLog({
      action: ACTIVITY_ACTIONS.METADATA_UPDATED,
      entityType: ENTITY_TYPES.CONTEXT,
      entityId: context._id,
      performedBy: req.body.performedBy || process.env.DEFAULT_USER || "System User",
      message: "File context updated",
      metadata: { fileId: req.params.fileId }
    });

    return successResponse(res, context, "File context updated successfully");
  } catch (error) {
    return next(error);
  }
};
