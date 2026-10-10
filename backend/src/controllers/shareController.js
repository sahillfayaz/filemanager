import { createShare, listFileShares, resolveShareDownload, revokeShare } from "../services/shareService.js";
import { successResponse } from "../utils/response.js";
import { toAbsoluteStoragePath } from "../config/storage.js";

export const addShare = async (req, res, next) => { try { const { share, token } = await createShare({ fileId: req.params.fileId, ...req.body, performedBy: req.user?.name || process.env.DEFAULT_USER }); const downloadUrl = `${req.protocol}://${req.get("host")}/api/shares/access/${token}/download`; return successResponse(res, { share, downloadUrl }, "Share link created successfully", 201); } catch (error) { return next(error); } };
export const getShares = async (req, res, next) => { try { return successResponse(res, await listFileShares(req.params.fileId), "File shares fetched successfully"); } catch (error) { return next(error); } };
export const revoke = async (req, res, next) => { try { return successResponse(res, await revokeShare({ id: req.params.id, performedBy: req.user?.name || process.env.DEFAULT_USER }), "Share revoked successfully"); } catch (error) { return next(error); } };
export const sharedDownload = async (req, res, next) => { try { const { file } = await resolveShareDownload(req.params.token); return res.download(toAbsoluteStoragePath(file.storagePath), file.originalName); } catch (error) { return next(error); } };
