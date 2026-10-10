import mongoose from "mongoose";
import { FILE_STATUS } from "../utils/constants.js";

const fileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    storedName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    },
    extension: {
      type: String,
      default: ""
    },
    sha256Hash: {
      type: String,
      required: true,
      index: true
    },
    storagePath: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(FILE_STATUS),
      default: FILE_STATUS.CONTENT,
      index: true
    },
    uploadedBy: {
      type: String,
      default: "System User",
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null
    }
  },
  { timestamps: true }
);

fileSchema.index({ originalName: "text", description: "text", sha256Hash: "text" });

const File = mongoose.model("File", fileSchema);

export default File;
