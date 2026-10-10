import mongoose from "mongoose";
import { ENTITY_TYPES } from "../utils/constants.js";

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true
    },
    entityType: {
      type: String,
      enum: Object.values(ENTITY_TYPES),
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true
    },
    message: {
      type: String,
      required: true
    },
    performedBy: {
      type: String,
      default: "System User"
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
