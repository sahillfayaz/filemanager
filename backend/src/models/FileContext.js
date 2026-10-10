import mongoose from "mongoose";
import { normalizeText } from "../utils/response.js";

const fileContextSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
      unique: true,
      index: true
    },
    employee: {
      type: String,
      default: "",
      trim: true
    },
    department: {
      type: String,
      default: "",
      trim: true
    },
    event: {
      type: String,
      default: "",
      trim: true
    },
    year: {
      type: String,
      default: "",
      trim: true
    },
    category: {
      type: String,
      default: "",
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    normalized: {
      employee: { type: String, default: "", index: true },
      department: { type: String, default: "", index: true },
      event: { type: String, default: "", index: true },
      year: { type: String, default: "", index: true },
      category: { type: String, default: "", index: true },
      tags: { type: [String], default: [], index: true }
    }
  },
  { timestamps: true }
);

fileContextSchema.pre("save", function normalize(next) {
  this.normalized = {
    employee: normalizeText(this.employee),
    department: normalizeText(this.department),
    event: normalizeText(this.event),
    year: normalizeText(this.year),
    category: normalizeText(this.category),
    tags: this.tags.map((tag) => normalizeText(tag)).filter(Boolean)
  };
  next();
});

const FileContext = mongoose.model("FileContext", fileContextSchema);

export default FileContext;
