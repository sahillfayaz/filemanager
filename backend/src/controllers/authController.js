import { bootstrapAdmin, createUser, getCurrentUser, listUsers, login } from "../services/authService.js";
import { successResponse } from "../utils/response.js";

export const bootstrap = async (req, res, next) => { try { return successResponse(res, await bootstrapAdmin(req.body), "Administrator account created", 201); } catch (error) { return next(error); } };
export const signIn = async (req, res, next) => { try { return successResponse(res, await login(req.body), "Signed in successfully"); } catch (error) { return next(error); } };
export const me = async (req, res, next) => { try { return successResponse(res, req.user, "Current user fetched successfully"); } catch (error) { return next(error); } };
export const addUser = async (req, res, next) => { try { return successResponse(res, await createUser(req.body), "User account created", 201); } catch (error) { return next(error); } };
export const users = async (req, res, next) => { try { return successResponse(res, await listUsers(), "Users fetched successfully"); } catch (error) { return next(error); } };
