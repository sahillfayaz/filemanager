import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["admin", "editor", "viewer"], default: "viewer", index: true },
  active: { type: Boolean, default: true },
  isPrimaryAdmin: { type: Boolean, default: false, index: true },
  approvalStatus: { type: String, enum: ["approved", "pending", "rejected"], default: "approved", index: true }
}, { timestamps: true });

userSchema.methods.verifyPassword = function (password) { return bcrypt.compare(password, this.passwordHash); };
// MongoDB permits only one document where isPrimaryAdmin is true.
userSchema.index(
  { isPrimaryAdmin: 1 },
  { unique: true, partialFilterExpression: { isPrimaryAdmin: true } }
);
export default mongoose.model("User", userSchema);
