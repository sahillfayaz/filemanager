import crypto from "crypto";
import File from "../models/File.js";
import FileShare from "../models/FileShare.js";
import { createActivityLog } from "./activityService.js";
import { ACTIVITY_ACTIONS, ENTITY_TYPES, FILE_STATUS } from "../utils/constants.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });

export const createShare = async ({ fileId, recipient, expiresInDays = 7, performedBy }) => {
  if (!String(recipient || "").trim()) throw fail("Recipient name or email is required", 400);
  const days = Number(expiresInDays);
  if (!Number.isFinite(days) || days < 1 || days > 90) throw fail("Expiry must be between 1 and 90 days", 400);
  const file = await File.findById(fileId);
  if (!file) throw fail("File not found", 404);
  if (file.status === FILE_STATUS.DELETION) throw fail("Files in deletion space cannot be shared", 400);
  const token = crypto.randomBytes(32).toString("base64url");
  const share = await FileShare.create({ fileId, recipient: recipient.trim(), tokenHash: hashToken(token), expiresAt: new Date(Date.now() + days * 86400000), createdBy: performedBy || process.env.DEFAULT_USER || "System User" });
  await createActivityLog({ action: ACTIVITY_ACTIONS.FILE_SHARED, entityType: ENTITY_TYPES.SHARE, entityId: share._id, performedBy, message: `File shared with ${share.recipient}`, metadata: { fileId, expiresAt: share.expiresAt } });
  return { share, token };
};

export const listFileShares = async (fileId) => FileShare.find({ fileId }).select("-tokenHash").sort({ createdAt: -1 });

export const revokeShare = async ({ id, performedBy }) => {
  const share = await FileShare.findById(id);
  if (!share) throw fail("Share not found", 404);
  if (!share.revokedAt) { share.revokedAt = new Date(); await share.save(); }
  await createActivityLog({ action: ACTIVITY_ACTIONS.FILE_SHARE_REVOKED, entityType: ENTITY_TYPES.SHARE, entityId: share._id, performedBy, message: `File share revoked for ${share.recipient}`, metadata: { fileId: share.fileId } });
  return share;
};

export const resolveShareDownload = async (token) => {
  const share = await FileShare.findOne({ tokenHash: hashToken(token), revokedAt: null }).populate("fileId");
  if (!share || share.expiresAt <= new Date() || !share.fileId || share.fileId.status === FILE_STATUS.DELETION) throw fail("This share link is invalid, expired, or revoked", 404);
  await createActivityLog({ action: ACTIVITY_ACTIONS.SHARED_FILE_DOWNLOADED, entityType: ENTITY_TYPES.SHARE, entityId: share._id, performedBy: share.recipient, message: `Shared file downloaded: ${share.fileId.originalName}`, metadata: { fileId: share.fileId._id } });
  return { share, file: share.fileId };
};
