import mongoose from "mongoose";

const fileShareSchema = new mongoose.Schema({
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File", required: true, index: true },
  recipient: { type: String, required: true, trim: true },
  permission: { type: String, enum: ["download"], default: "download" },
  tokenHash: { type: String, required: true, unique: true, select: false },
  // The TTL index below both indexes this field and removes expired shares.
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  createdBy: { type: String, default: "System User", trim: true }
}, { timestamps: true });

fileShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model("FileShare", fileShareSchema);
