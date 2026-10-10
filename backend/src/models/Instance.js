import mongoose from "mongoose";

const instanceSchema = new mongoose.Schema(
  {
    conceptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Concept",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

const Instance = mongoose.model("Instance", instanceSchema);

export default Instance;
