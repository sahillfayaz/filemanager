import mongoose from "mongoose";

const relationshipSchema = new mongoose.Schema(
  {
    sourceType: {
      type: String,
      required: true,
      trim: true
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    targetType: {
      type: String,
      required: true,
      trim: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    relationshipType: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

relationshipSchema.index({ sourceType: 1, sourceId: 1, targetType: 1, targetId: 1, relationshipType: 1 });

const Relationship = mongoose.model("Relationship", relationshipSchema);

export default Relationship;
