import path from "path";
import {
  createFileFromUpload,
  getFileById,
  getFileDocumentById,
  listFilesByStatus,
  moveFileToStatus,
  permanentlyDeleteFile
} from "../services/fileService.js";
import { createActivityLog } from "../services/activityService.js";
import { successResponse } from "../utils/response.js";
import { ACTIVITY_ACTIONS, ENTITY_TYPES, FILE_STATUS } from "../utils/constants.js";
import { toAbsoluteStoragePath } from "../config/storage.js";

export const uploadFile = async (req, res, next) => {
  try {
    const file = await createFileFromUpload({
      uploadedFile: req.file,
      body: { ...req.body, uploadedBy: req.user?.name || req.body.uploadedBy }
    });
    return successResponse(res, file, "File uploaded successfully", 201);
  } catch (error) {
    return next(error);
  }
};

export const getFiles = async (req, res, next) => {
  try {
    const data = await listFilesByStatus(req.query);
    return successResponse(res, data, "Files fetched successfully");
  } catch (error) {
    return next(error);
  }
};

export const getFileDetails = async (req, res, next) => {
  try {
    const file = await getFileById(req.params.id);
    return successResponse(res, file, "File details fetched successfully");
  } catch (error) {
    return next(error);
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    const file = await getFileDocumentById(req.params.id);
    const absolutePath = toAbsoluteStoragePath(file.storagePath);

    await createActivityLog({
      action: ACTIVITY_ACTIONS.FILE_DOWNLOADED,
      entityType: ENTITY_TYPES.FILE,
      entityId: file._id,
      performedBy: req.user?.name || process.env.DEFAULT_USER || "System User",
      message: `File downloaded: ${file.originalName}`
    });

    return res.download(absolutePath, file.originalName);
  } catch (error) {
    return next(error);
  }
};

export const archiveFile = async (req, res, next) => {
  try {
    const file = await moveFileToStatus({
      id: req.params.id,
      status: FILE_STATUS.ARCHIVE,
      performedBy: req.user?.name
    });
    return successResponse(res, file, "File moved to archive space");
  } catch (error) {
    return next(error);
  }
};

export const restoreFile = async (req, res, next) => {
  try {
    const file = await moveFileToStatus({
      id: req.params.id,
      status: FILE_STATUS.CONTENT,
      performedBy: req.user?.name
    });
    return successResponse(res, file, "File restored to content space");
  } catch (error) {
    return next(error);
  }
};

export const moveFileToDeletion = async (req, res, next) => {
  try {
    const file = await moveFileToStatus({
      id: req.params.id,
      status: FILE_STATUS.DELETION,
      performedBy: req.user?.name
    });
    return successResponse(res, file, "File moved to deletion space");
  } catch (error) {
    return next(error);
  }
};

export const permanentDelete = async (req, res, next) => {
  try {
    const deletedFile = await permanentlyDeleteFile({
      id: req.params.id,
      performedBy: req.user?.name
    });
    return successResponse(
      res,
      { id: deletedFile._id, originalName: deletedFile.originalName },
      "File permanently deleted"
    );
  } catch (error) {
    return next(error);
  }
};
