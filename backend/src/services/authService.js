import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const jwtSecret = () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw fail("JWT_SECRET must be set to a value of at least 32 characters", 500);
  return process.env.JWT_SECRET;
};
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, active: user.active, createdAt: user.createdAt });
const issueToken = (user) => jwt.sign({ sub: String(user._id), role: user.role, name: user.name }, jwtSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || "8h" });

const validateUserInput = ({ name, email, password }) => {
  if (!String(name || "").trim()) throw fail("Name is required", 400);
  if (!/^\S+@\S+\.\S+$/.test(String(email || ""))) throw fail("A valid email is required", 400);
  if (String(password || "").length < 8) throw fail("Password must be at least 8 characters", 400);
};

export const bootstrapAdmin = async (data) => {
  validateUserInput(data);
  if (await User.exists({})) throw fail("An account already exists. Ask an administrator to create additional users.", 409);
  const user = await User.create({ name: data.name.trim(), email: data.email.trim().toLowerCase(), passwordHash: await bcrypt.hash(data.password, 12), role: "admin" });
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
  return publicUser(user);
};

export const createUser = async (data) => {
  validateUserInput(data);
  const exists = await User.exists({ email: data.email.trim().toLowerCase() });
  if (exists) throw fail("An account with this email already exists", 409);
  const user = await User.create({ name: data.name.trim(), email: data.email.trim().toLowerCase(), passwordHash: await bcrypt.hash(data.password, 12), role: ["admin", "editor", "viewer"].includes(data.role) ? data.role : "viewer" });
  return publicUser(user);
};

export const listUsers = async () => (await User.find().sort({ createdAt: -1 })).map(publicUser);
export const verifyToken = (token) => jwt.verify(token, jwtSecret());
