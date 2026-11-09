import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const jwtSecret = () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw fail("JWT_SECRET must be set to a value of at least 32 characters", 500);
  return process.env.JWT_SECRET;
};
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, active: user.active, isPrimaryAdmin: user.isPrimaryAdmin, approvalStatus: user.approvalStatus, createdAt: user.createdAt });
const issueToken = (user) => jwt.sign({ sub: String(user._id), role: user.role, name: user.name }, jwtSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || "8h" });

const validateUserInput = ({ name, email, password }) => {
  if (!String(name || "").trim()) throw fail("Name is required", 400);
  if (!/^\S+@\S+\.\S+$/.test(String(email || ""))) throw fail("A valid email is required", 400);
  if (String(password || "").length < 8) throw fail("Password must be at least 8 characters", 400);
};

export const bootstrapAdmin = async (data) => {
  validateUserInput(data);
  if (await User.exists({})) throw fail("An account already exists. Ask an administrator to create additional users.", 409);
  const user = await User.create({ name: data.name.trim(), email: data.email.trim().toLowerCase(), passwordHash: await bcrypt.hash(data.password, 12), role: "admin", isPrimaryAdmin: true });
  return { user: publicUser(user), token: issueToken(user) };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: String(email || "").trim().toLowerCase() }).select("+passwordHash");
  if (!user || !user.active || !(await user.verifyPassword(password || ""))) throw fail("Invalid email or password", 401);
  return { user: publicUser(user), token: issueToken(user) };
};

export const getCurrentUser = async (id) => {
  const user = await User.findById(id);
  if (!user || !user.active) throw fail("User account is unavailable", 401);
  if (user.role === "admin" && !(await User.exists({ isPrimaryAdmin: true }))) {
    // Supports existing projects created before the primary-admin field existed.
    // The unique partial index prevents more than one account being promoted.
    const firstAdmin = await User.findOneAndUpdate(
      { role: "admin", active: true, isPrimaryAdmin: { $ne: true } },
      { $set: { isPrimaryAdmin: true } },
      { sort: { createdAt: 1 }, new: true }
    );
    if (firstAdmin && String(firstAdmin._id) === String(user._id)) user.isPrimaryAdmin = true;
  }
  return publicUser(user);
};

export const createUser = async (data) => {
  validateUserInput(data);
  const exists = await User.exists({ email: data.email.trim().toLowerCase() });
  if (exists) throw fail("An account with this email already exists", 409);
  const role = ["admin", "editor", "viewer"].includes(data.role) ? data.role : "viewer";
  if (role === "admin") throw fail("New administrators must use the approval request flow", 400);
  const user = await User.create({ name: data.name.trim(), email: data.email.trim().toLowerCase(), passwordHash: await bcrypt.hash(data.password, 12), role });
  return publicUser(user);
};

export const listUsers = async () => (await User.find().sort({ createdAt: -1 })).map(publicUser);
export const requestAdmin = async (data) => {
  validateUserInput(data);
  const email = data.email.trim().toLowerCase();
  if (await User.exists({ email })) throw fail("An account with this email already exists", 409);
  const user = await User.create({ name: data.name.trim(), email, passwordHash: await bcrypt.hash(data.password, 12), role: "admin", active: false, approvalStatus: "pending" });
  return publicUser(user);
};
export const listAdminRequests = async () => (await User.find({ role: "admin", approvalStatus: "pending" }).sort({ createdAt: 1 })).map(publicUser);
export const decideAdminRequest = async ({ id, approve }) => {
  const user = await User.findOne({ _id: id, role: "admin", approvalStatus: "pending" });
  if (!user) throw fail("Pending administrator request not found", 404);
  user.approvalStatus = approve ? "approved" : "rejected";
  user.active = Boolean(approve);
  await user.save();
  return publicUser(user);
};
export const verifyToken = (token) => jwt.verify(token, jwtSecret());
