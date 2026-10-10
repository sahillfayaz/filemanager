import mongoose from "mongoose";
import { normalizeText } from "../utils/response.js";

const metadataSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true
    },
    key: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    },
    normalizedKey: {
      type: String,
      index: true
    },
    normalizedValue: {
      type: String,
      index: true
    }
  },
  { timestamps: true }
);

metadataSchema.pre("save", function normalize(next) {
  this.normalizedKey = normalizeText(this.key);
  this.normalizedValue = normalizeText(this.value);
  next();
});

metadataSchema.index({ normalizedKey: 1, normalizedValue: 1 });

const Metadata = mongoose.model("Metadata", metadataSchema);

export default Metadata;
