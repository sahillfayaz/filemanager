import mongoose from "mongoose";

const conceptSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      default: "",
      trim: true
    },
    parentConceptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Concept",
      default: null
    },
    description: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

const Concept = mongoose.model("Concept", conceptSchema);

export default Concept;
